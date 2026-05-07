export interface Request {
  id: string;
  patientName: string;
  hospital: string;
  bloodType: string;
  quantity: number; // units
  urgency: 'critical' | 'high' | 'moderate' | 'low';
  status: 'pending' | 'in_progress' | 'fulfilled' | 'cancelled';
  requestedAt: string;
  neededBy: string;
  notes: string;
  contactPerson: string;
  phone: string;
  location: 'inside_valley' | 'outside_valley';
}

export interface Donor {
  id: string;
  name: string;
  bloodType: string;
  phone: string;
  location: string;
  lastDonation: string;
  rating: number; // 0-5
  donationCount: number;
  status: 'available' | 'unavailable' | 'blacklisted';
  blacklistReason?: string;
}

export interface Feedback {
  id: string;
  type: 'patient' | 'donor';
  name: string;
  message: string;
  rating: number; // 0-5
  createdAt: string;
  status: 'new' | 'reviewed' | 'resolved';
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  bloodInventory: {
    'O+': number;
    'O-': number;
    'A+': number;
    'A-': number;
    'B+': number;
    'B-': number;
    'AB+': number;
    'AB-': number;
  };
  contactPerson: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'volunteer';
  joinedAt: string;
  isActive: boolean;
}

// Dummy Data
export const requestsData: Request[] = [
  {
    id: 'REQ001',
    patientName: 'Ramesh Sharma',
    hospital: 'Kathmandu Medical Center',
    bloodType: 'O+',
    quantity: 4,
    urgency: 'critical',
    status: 'in_progress',
    requestedAt: '2024-04-21T08:30:00',
    neededBy: '2024-04-21T12:00:00',
    notes: 'Post-surgery requirement',
    contactPerson: 'Dr. Poonam Joshi',
    phone: '+977-1-4123456',
  },
  {
    id: 'REQ002',
    patientName: 'Priya Adhikari',
    hospital: 'Tribhuvan University Teaching Hospital',
    bloodType: 'A-',
    quantity: 2,
    urgency: 'high',
    status: 'pending',
    requestedAt: '2024-04-21T09:15:00',
    neededBy: '2024-04-21T14:00:00',
    notes: 'Emergency transfusion',
    contactPerson: 'Dr. Arjun Rai',
    phone: '+977-1-4987654',
  },
  {
    id: 'REQ003',
    patientName: 'Sunita Tamang',
    hospital: 'Nepal Cancer Hospital',
    bloodType: 'B+',
    quantity: 6,
    urgency: 'moderate',
    status: 'pending',
    requestedAt: '2024-04-21T07:45:00',
    neededBy: '2024-04-21T18:00:00',
    notes: 'Chemotherapy support',
    contactPerson: 'Dr. Kiran Shrestha',
    phone: '+977-1-5555555',
  },
  {
    id: 'REQ004',
    patientName: 'Ram Bahadur Singh',
    hospital: 'Dhulikhel Hospital',
    bloodType: 'AB+',
    quantity: 3,
    urgency: 'low',
    status: 'fulfilled',
    requestedAt: '2024-04-20T15:30:00',
    neededBy: '2024-04-22T10:00:00',
    notes: 'Routine procedure',
    contactPerson: 'Dr. Meena Karki',
    phone: '+977-45-680001',
  },
  {
    id: 'REQ005',
    patientName: 'Anita Gurung',
    hospital: 'Bir Hospital',
    bloodType: 'O-',
    quantity: 2,
    urgency: 'critical',
    status: 'in_progress',
    requestedAt: '2024-04-21T10:00:00',
    neededBy: '2024-04-21T13:00:00',
    notes: 'Trauma patient',
    contactPerson: 'Dr. Raj Poudel',
    phone: '+977-1-4414775',
  },
];

export const donorsData: Donor[] = [
  {
    id: 'D001',
    name: 'Prakash Sharma',
    bloodType: 'O+',
    phone: '+977-9841234567',
    location: 'Kathmandu',
    lastDonation: '2024-04-15',
    rating: 4.8,
    donationCount: 12,
    status: 'available',
  },
  {
    id: 'D002',
    name: 'Mohan Lama',
    bloodType: 'O+',
    phone: '+977-9842345678',
    location: 'Kathmandu',
    lastDonation: '2024-04-10',
    rating: 4.9,
    donationCount: 18,
    status: 'available',
  },
  {
    id: 'D003',
    name: 'Kalpana Subedi',
    bloodType: 'A+',
    phone: '+977-9843456789',
    location: 'Patan',
    lastDonation: '2024-04-20',
    rating: 4.5,
    donationCount: 8,
    status: 'unavailable',
  },
  {
    id: 'D004',
    name: 'Raj Kumar Verma',
    bloodType: 'B+',
    phone: '+977-9844567890',
    location: 'Bhaktapur',
    lastDonation: '2024-03-30',
    rating: 4.2,
    donationCount: 5,
    status: 'available',
  },
  {
    id: 'D005',
    name: 'Bijay Singh',
    bloodType: 'AB+',
    phone: '+977-9845678901',
    location: 'Kathmandu',
    lastDonation: '2024-02-15',
    rating: 3.0,
    donationCount: 2,
    status: 'blacklisted',
    blacklistReason: 'No-show on 3 occasions',
  },
  {
    id: 'D006',
    name: 'Deepa Niroula',
    bloodType: 'O-',
    phone: '+977-9846789012',
    location: 'Kathmandu',
    lastDonation: '2024-04-18',
    rating: 4.7,
    donationCount: 15,
    status: 'available',
  },
  {
    id: 'D007',
    name: 'Arjun Thapa',
    bloodType: 'A-',
    phone: '+977-9847890123',
    location: 'Patan',
    lastDonation: '2024-04-08',
    rating: 4.3,
    donationCount: 7,
    status: 'available',
  },
  {
    id: 'D008',
    name: 'Sanjay Mallik',
    bloodType: 'B-',
    phone: '+977-9848901234',
    location: 'Kathmandu',
    lastDonation: '2024-01-20',
    rating: 2.8,
    donationCount: 1,
    status: 'blacklisted',
    blacklistReason: 'Health concerns',
  },
];

export const feedbackData: Feedback[] = [
  {
    id: 'FB001',
    type: 'patient',
    name: 'Ramesh Sharma',
    message: 'Excellent service! Blood was delivered on time.',
    rating: 5,
    createdAt: '2024-04-20T18:30:00',
    status: 'reviewed',
  },
  {
    id: 'FB002',
    type: 'donor',
    name: 'Prakash Sharma',
    message: 'The process was smooth and staff was very helpful.',
    rating: 5,
    createdAt: '2024-04-19T14:15:00',
    status: 'reviewed',
  },
  {
    id: 'FB003',
    type: 'patient',
    name: 'Priya Adhikari',
    message: 'Good service but took longer than expected.',
    rating: 3,
    createdAt: '2024-04-21T09:00:00',
    status: 'new',
  },
  {
    id: 'FB004',
    type: 'donor',
    name: 'Deepa Niroula',
    message: 'Very professional team. Would donate again!',
    rating: 4,
    createdAt: '2024-04-21T10:30:00',
    status: 'new',
  },
  {
    id: 'FB005',
    type: 'patient',
    name: 'Anita Gurung',
    message: 'Critical situation handled perfectly. Thank you!',
    rating: 5,
    createdAt: '2024-04-21T11:00:00',
    status: 'new',
  },
];

export const hospitalsData: Hospital[] = [
  {
    id: 'H001',
    name: 'Kathmandu Medical Center',
    location: 'Durbarmarg, Kathmandu',
    bloodInventory: {
      'O+': 8,
      'O-': 2,
      'A+': 5,
      'A-': 1,
      'B+': 4,
      'B-': 1,
      'AB+': 2,
      'AB-': 0,
    },
    contactPerson: 'Dr. Poonam Joshi',
    phone: '+977-1-4123456',
  },
  {
    id: 'H002',
    name: 'Tribhuvan University Teaching Hospital',
    location: 'Maharajgunj, Kathmandu',
    bloodInventory: {
      'O+': 15,
      'O-': 5,
      'A+': 12,
      'A-': 3,
      'B+': 10,
      'B-': 2,
      'AB+': 4,
      'AB-': 1,
    },
    contactPerson: 'Dr. Arjun Rai',
    phone: '+977-1-4987654',
  },
  {
    id: 'H003',
    name: 'Nepal Cancer Hospital',
    location: 'Hadikhola, Bhaktapur',
    bloodInventory: {
      'O+': 6,
      'O-': 1,
      'A+': 3,
      'A-': 0,
      'B+': 2,
      'B-': 0,
      'AB+': 1,
      'AB-': 0,
    },
    contactPerson: 'Dr. Kiran Shrestha',
    phone: '+977-1-5555555',
  },
  {
    id: 'H004',
    name: 'Bir Hospital',
    location: 'Kaisermahal, Kathmandu',
    bloodInventory: {
      'O+': 12,
      'O-': 4,
      'A+': 10,
      'A-': 2,
      'B+': 8,
      'B-': 1,
      'AB+': 3,
      'AB-': 0,
    },
    contactPerson: 'Dr. Raj Poudel',
    phone: '+977-1-4414775',
  },
];

export const usersData: User[] = [
  {
    id: 'U001',
    name: 'Admin User',
    email: 'sushil.rumsan@gmail.com',
    role: 'admin',
    joinedAt: '2024-01-01',
    isActive: true,
  },
  {
    id: 'U002',
    name: 'Sharma Volunteer',
    email: 'volunteer@hamrolife.org',
    role: 'volunteer',
    joinedAt: '2024-02-15',
    isActive: true,
  },
  {
    id: 'U003',
    name: 'Volunteer Coordinator',
    email: 'volunteer3@hamrolife.org',
    role: 'volunteer',
    joinedAt: '2024-03-01',
    isActive: true,
  },
  {
    id: 'U004',
    name: 'Poudel Volunteer',
    email: 'volunteer2@hamrolife.org',
    role: 'volunteer',
    joinedAt: '2024-01-20',
    isActive: false,
  },
];

// Helper functions - Using Hamro Life Bank color scheme
// Primary: #E63946 (Soft Red)
// Secondary: #1D3557 (Deep Blue)
// Accent: #A8DADC (Light Teal)
export const getUrgencyColor = (urgency: Request['urgency']) => {
  switch (urgency) {
    case 'critical':
      return 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/30';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'moderate':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'low':
      return 'bg-[#A8DADC] text-[#1D3557] border-[#A8DADC]';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export const getStatusColor = (status: Request['status'] | Donor['status']) => {
  switch (status) {
    case 'pending':
    case 'unavailable':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'in_progress':
      return 'bg-[#1D3557]/10 text-[#1D3557] border-[#1D3557]/30';
    case 'fulfilled':
    case 'available':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'cancelled':
    case 'blacklisted':
      return 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/30';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};
