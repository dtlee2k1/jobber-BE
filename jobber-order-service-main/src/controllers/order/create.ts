import { IOrderDocument } from '@dtlee2k1/jobber-shared';
import envConfig from '@order/config';
import { BadRequestError } from '@order/error-handler';
import { orderSchema } from '@order/schemes/order';
import { createOrder } from '@order/services/order.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';

const stripe = new Stripe(envConfig.STRIPE_API_KEY!, {
  typescript: true
});

export async function paymentIntent(req: Request, res: Response, _next: NextFunction) {
  const customer = await stripe.customers.search({
    query: `email:'${req.currentUser!.email}'`
  });

  let customerId = '';

  if (customer.data.length === 0) {
    const createdCustomer = await stripe.customers.create({
      email: `${req.currentUser!.email}`,
      metadata: {
        buyerId: `${req.body.buyerId}`
      }
    });
    customerId = createdCustomer.id;
  } else {
    customerId = customer.data[0].id;
  }

  let paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
  if (customerId) {
    // the service charge is 5.5% of the purchase amount
    // for purchases under $50, an additional $2 is applied
    const serviceFee: number = req.body.price < 50 ? (5.5 / 100) * req.body.price + 2 : (5.5 / 100) * req.body.price;
    paymentIntent = await stripe.paymentIntents.create({
      amount: Math.floor((req.body.price + serviceFee) * 100),
      currency: 'usd',
      customer: customerId,
      payment_method_types: ['card']
    });
  }

  res.status(StatusCodes.CREATED).json({
    message: 'Order intent created successfully',
    clientSecret: paymentIntent!.client_secret,
    paymentIntentId: paymentIntent!.id
  });
}

export async function order(req: Request, res: Response, _next: NextFunction) {
  const { error } = await Promise.resolve(orderSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Create order() method error');
  }

  const serviceFee: number = req.body.price < 50 ? (5.5 / 100) * req.body.price + 2 : (5.5 / 100) * req.body.price;
  let orderData: IOrderDocument = req.body;
  orderData = { ...orderData, serviceFee };

  const order = await createOrder(orderData);
  res.status(StatusCodes.CREATED).json({
    message: 'Order created successfully',
    order
  });
}
