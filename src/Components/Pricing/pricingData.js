// This file can now be deprecated since we're using useAdminData hook
// Keeping it for reference during backend integration

// TODO: Backend Integration - Remove this file once backend is implemented
// Pricing data will come from database via API calls
export const pricingPlans = [
  {
    package: 'Express',
    photocount: '1-10 photos',
    turnaround: '48 hours',
    price: '$60',
    popular: false
  },
  {
    package: 'Quick',
    photocount: '11-25 photos',
    turnaround: '36 hours',
    price: '$100',
    popular: true
  },
  {
    package: 'Standered',
    photocount: '26-50 photos',
    turnaround: '24 hours',
    price: '$130',
    popular: false
  },
  {
    package: 'Pro',
    photocount: '50+ photos',
    turnaround: 'Custom',
    price: '$200',
    popular: false
  },
  {
    package: 'Ultra',
    photocount: '50+ photos',
    turnaround: 'Custom',
    price: '$280',
    popular: false
  }
];