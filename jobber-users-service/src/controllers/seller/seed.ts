import { NextFunction, Request, Response } from 'express';
import { IBuyerDocument, IEducation, IExperience, ISellerDocument } from '@dtlee2k1/jobber-shared';
import { faker } from '@faker-js/faker';
import { floor, random, sample, sampleSize } from 'lodash';
import { getRandomBuyers } from '@users/services/buyer.service';
import { createSeller, getSellerByEmail } from '@users/services/seller.service';
import { BadRequestError } from '@users/error-handler';
import { v4 as uuidV4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';

export async function createSeedSellers(req: Request, res: Response, _next: NextFunction) {
  const { count } = req.params;
  const buyers: IBuyerDocument[] = await getRandomBuyers(parseInt(count));
  for (let i = 0; i < buyers.length; i++) {
    const buyer: IBuyerDocument = buyers[i];
    const checkIfSellerExist: ISellerDocument | null = await getSellerByEmail(`${buyer.email}`);
    if (checkIfSellerExist) {
      throw new BadRequestError('Seller already exist.', 'SellerSeed seller() method error');
    }
    const basicDescription: string = faker.commerce.productDescription();
    const skills: string[] = [
      'Programming',
      'Web development',
      'Mobile development',
      'Proof reading',
      'UI/UX',
      'Data Science',
      'Financial modeling',
      'Data analysis'
    ];
    const seller: ISellerDocument = {
      profilePublicId: uuidV4(),
      fullName: faker.person.fullName(),
      username: buyer.username,
      email: buyer.email,
      country: faker.location.country(),
      profilePicture: buyer.profilePicture,
      description: basicDescription.length <= 250 ? basicDescription : basicDescription.slice(0, 250),
      oneliner: faker.word.words({ count: { min: 5, max: 10 } }),
      skills: sampleSize(skills, sample([1, 4])),
      languages: [
        { language: 'Vietnamese', level: 'Native' },
        { language: 'English', level: 'Upper-Intermediate' },
        { language: 'Japanese', level: 'Basic' }
      ],
      responseTime: parseInt(faker.commerce.price({ min: 1, max: 5, dec: 0 })),
      experience: randomExperiences(parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 }))),
      education: randomEducation(parseInt(faker.commerce.price({ min: 2, max: 4, dec: 0 }))),
      socialLinks: ['http://youtube.com', 'https://facebook.com', 'https://github.com'],
      certificates: [
        {
          name: 'ReactJS Developer',
          from: 'Software Academy',
          year: 2021
        },
        {
          name: 'ExpressJS Developer',
          from: 'Software Academy',
          year: 2020
        },
        {
          name: 'IOS App Developer',
          from: 'Apple Inc.',
          year: 2019
        }
      ]
    };
    await createSeller(seller);
  }
  res.status(StatusCodes.CREATED).json({ message: 'Sellers created successfully' });
}

function randomExperiences(count: number) {
  const result: IExperience[] = [];

  for (let i = 0; i < count; i++) {
    const randomStartYear = [2019, 2020, 2021, 2022, 2023, 2024];
    const randomEndYear = ['Current', '2024', '2025', '2026', '2027'];
    const endYear = randomEndYear[floor(random(0.9) * randomEndYear.length)];
    const experience = {
      company: faker.company.name(),
      title: faker.person.jobTitle(),
      startDate: `${faker.date.month()} ${randomStartYear[floor(random(0.9) * randomStartYear.length)]}`,
      endDate: endYear === 'Current' ? 'Current' : `${faker.date.month()} ${endYear}`,
      description: faker.commerce.productDescription().slice(0, 100),
      currentlyWorkingHere: endYear === 'Current'
    };
    result.push(experience);
  }

  return result;
}

function randomEducation(count: number) {
  const result: IEducation[] = [];

  for (let i = 0; i < count; i++) {
    const randomYear = [2019, 2020, 2021, 2022, 2023, 2024];
    const education = {
      country: faker.location.country(),
      university: faker.company.name(),
      major: `${faker.person.jobArea()} ${faker.person.jobDescriptor()}`,
      title: faker.person.jobTitle(),
      year: `${randomYear[floor(random(0.9) * randomYear.length)]}`
    };
    result.push(education);
  }

  return result;
}
