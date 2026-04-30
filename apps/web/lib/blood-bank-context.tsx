'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  Request,
  Donor,
  Feedback,
  Hospital,
  User,
  requestsData,
  donorsData,
  feedbackData,
  hospitalsData,
  usersData,
} from './dummy-data';

interface BloodBankContextType {
  // Requests
  requests: Request[];
  updateRequest: (id: string, data: Partial<Request>) => void;
  deleteRequest: (id: string) => void;
  addRequest: (request: Request) => void;

  // Donors
  donors: Donor[];
  updateDonor: (id: string, data: Partial<Donor>) => void;
  deleteDonor: (id: string) => void;
  addDonor: (donor: Donor) => void;

  // Feedback
  feedback: Feedback[];
  updateFeedback: (id: string, data: Partial<Feedback>) => void;
  deleteFeedback: (id: string) => void;
  addFeedback: (feedback: Omit<Feedback, 'id'>) => void;

  // Hospitals
  hospitals: Hospital[];
  updateHospital: (id: string, data: Partial<Hospital>) => void;
  addHospital: (hospital: Hospital) => void;

  // Users
  users: User[];
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addUser: (user: User) => void;
}

const BloodBankContext = createContext<BloodBankContextType | undefined>(
  undefined
);

export function BloodBankProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [requests, setRequests] = useState<Request[]>(requestsData);
  const [donors, setDonors] = useState<Donor[]>(donorsData);
  const [feedback, setFeedback] = useState<Feedback[]>(feedbackData);
  const [hospitals, setHospitals] = useState<Hospital[]>(hospitalsData);
  const [users, setUsers] = useState<User[]>(usersData);

  // Request handlers
  const updateRequest = (id: string, data: Partial<Request>) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, ...data } : req))
    );
  };

  const deleteRequest = (id: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const addRequest = (request: Request) => {
    setRequests((prev) => [request, ...prev]);
  };

  // Donor handlers
  const updateDonor = (id: string, data: Partial<Donor>) => {
    setDonors((prev) =>
      prev.map((donor) => (donor.id === id ? { ...donor, ...data } : donor))
    );
  };

  const deleteDonor = (id: string) => {
    setDonors((prev) => prev.filter((donor) => donor.id !== id));
  };

  const addDonor = (donor: Donor) => {
    setDonors((prev) => [donor, ...prev]);
  };

  // Feedback handlers
  const updateFeedback = (id: string, data: Partial<Feedback>) => {
    setFeedback((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, ...data } : fb))
    );
  };

  const deleteFeedback = (id: string) => {
    setFeedback((prev) => prev.filter((fb) => fb.id !== id));
  };

  const addFeedback = (newFeedback: Omit<Feedback, 'id'>) => {
    const feedbackWithId = { ...newFeedback, id: `FB${Date.now()}` };
    setFeedback((prev) => [feedbackWithId, ...prev]);
  };

  // Hospital handlers
  const updateHospital = (id: string, data: Partial<Hospital>) => {
    setHospitals((prev) =>
      prev.map((hospital) =>
        hospital.id === id ? { ...hospital, ...data } : hospital
      )
    );
  };

  const addHospital = (hospital: Hospital) => {
    setHospitals((prev) => [hospital, ...prev]);
  };

  // User handlers
  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...data } : user))
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const addUser = (user: User) => {
    setUsers((prev) => [user, ...prev]);
  };

  return (
    <BloodBankContext.Provider
      value={{
        requests,
        updateRequest,
        deleteRequest,
        addRequest,
        donors,
        updateDonor,
        deleteDonor,
        addDonor,
        feedback,
        updateFeedback,
        deleteFeedback,
        addFeedback,
        hospitals,
        updateHospital,
        addHospital,
        users,
        updateUser,
        deleteUser,
        addUser,
      }}
    >
      {children}
    </BloodBankContext.Provider>
  );
}

export function useBloodBank() {
  const context = useContext(BloodBankContext);
  if (context === undefined) {
    throw new Error('useBloodBank must be used within BloodBankProvider');
  }
  return context;
}
