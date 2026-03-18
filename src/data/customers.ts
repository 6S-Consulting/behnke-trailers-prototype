import { Customer } from '@/types';

export const customers: Customer[] = [
  { id: 'c1', name: 'John Hartmann', email: 'john@hartmannfarms.com', phone: '(515) 555-1001', company: 'Hartmann Farms', address: '2847 County Road 12, Ames, IA 50010', state: 'IA', ownedTrailers: ['st1', 'st2'], assignedDealerId: 'd1', joinDate: '2021-04-15' },
  { id: 'c2', name: 'Maria Gutierrez', email: 'maria@gutierrezag.com', phone: '(515) 555-1002', company: 'Gutierrez Ag Services', address: '1490 Hwy 30, Marshalltown, IA 50158', state: 'IA', ownedTrailers: ['st3'], assignedDealerId: 'd1', joinDate: '2022-01-20' },
  { id: 'c3', name: 'Steve Palmer', email: 'steve@palmerconst.com', phone: '(515) 555-1003', company: 'Palmer Construction', address: '780 E University Ave, Des Moines, IA 50316', state: 'IA', ownedTrailers: ['st4', 'st5'], assignedDealerId: 'd1', joinDate: '2020-08-10' },
  { id: 'c4', name: 'Rachel Kim', email: 'rachel@kimtelecom.com', phone: '(402) 555-1004', company: 'Kim Telecom Services', address: '3200 O Street, Lincoln, NE 68510', state: 'NE', ownedTrailers: ['st6'], assignedDealerId: 'd2', joinDate: '2023-03-05' },
  { id: 'c5', name: 'Bill Thompson', email: 'bill@thompson-ranch.com', phone: '(402) 555-1005', company: 'Thompson Ranch', address: '5100 Pioneer Blvd, Lincoln, NE 68506', state: 'NE', ownedTrailers: ['st7'], assignedDealerId: 'd2', joinDate: '2021-11-18' },
  { id: 'c6', name: 'Dave Krueger', email: 'dave@kruegerfarming.com', phone: '(605) 555-1006', company: 'Krueger Farming Co', address: '14200 SD-42, Sioux Falls, SD 57106', state: 'SD', ownedTrailers: ['st8'], assignedDealerId: 'd3', joinDate: '2022-06-30' },
  { id: 'c7', name: 'Angela Torres', email: 'angela@torreshaul.com', phone: '(316) 555-1007', company: 'Torres Heavy Hauling', address: '900 S Hydraulic, Wichita, KS 67211', state: 'KS', ownedTrailers: ['st9', 'st10'], assignedDealerId: 'd4', joinDate: '2020-02-14' },
  { id: 'c8', name: 'Mike Chen', email: 'mike@chenconstruction.com', phone: '(316) 555-1008', company: 'Chen Construction', address: '4400 E Douglas, Wichita, KS 67218', state: 'KS', ownedTrailers: ['st11'], assignedDealerId: 'd4', joinDate: '2023-09-22' },
  { id: 'c9', name: 'Larry Williams', email: 'larry@williams-transport.com', phone: '(314) 555-1009', company: 'Williams Transport', address: '7800 S Broadway, St. Louis, MO 63111', state: 'MO', ownedTrailers: ['st12', 'st13'], assignedDealerId: 'd5', joinDate: '2019-07-04' },
  { id: 'c10', name: 'Sue Hendricks', email: 'sue@hendricksutility.com', phone: '(414) 555-1010', company: 'Hendricks Utility', address: '2200 W Silver Spring Dr, Milwaukee, WI 53209', state: 'WI', ownedTrailers: ['st14'], assignedDealerId: 'd7', joinDate: '2022-12-01' },
];
