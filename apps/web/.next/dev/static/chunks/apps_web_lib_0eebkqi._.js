(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/web/lib/dummy-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "donorsData",
    ()=>donorsData,
    "feedbackData",
    ()=>feedbackData,
    "getStatusColor",
    ()=>getStatusColor,
    "getUrgencyColor",
    ()=>getUrgencyColor,
    "hospitalsData",
    ()=>hospitalsData,
    "requestsData",
    ()=>requestsData,
    "usersData",
    ()=>usersData
]);
const requestsData = [
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
        phone: '+977-1-4123456'
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
        phone: '+977-1-4987654'
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
        phone: '+977-1-5555555'
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
        phone: '+977-45-680001'
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
        phone: '+977-1-4414775'
    }
];
const donorsData = [
    {
        id: 'D001',
        name: 'Prakash Sharma',
        bloodType: 'O+',
        phone: '+977-9841234567',
        location: 'Kathmandu',
        lastDonation: '2024-04-15',
        rating: 4.8,
        donationCount: 12,
        status: 'available'
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
        status: 'available'
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
        status: 'unavailable'
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
        status: 'available'
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
        blacklistReason: 'No-show on 3 occasions'
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
        status: 'available'
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
        status: 'available'
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
        blacklistReason: 'Health concerns'
    }
];
const feedbackData = [
    {
        id: 'FB001',
        type: 'patient',
        name: 'Ramesh Sharma',
        message: 'Excellent service! Blood was delivered on time.',
        rating: 5,
        createdAt: '2024-04-20T18:30:00',
        status: 'reviewed'
    },
    {
        id: 'FB002',
        type: 'donor',
        name: 'Prakash Sharma',
        message: 'The process was smooth and staff was very helpful.',
        rating: 5,
        createdAt: '2024-04-19T14:15:00',
        status: 'reviewed'
    },
    {
        id: 'FB003',
        type: 'patient',
        name: 'Priya Adhikari',
        message: 'Good service but took longer than expected.',
        rating: 3,
        createdAt: '2024-04-21T09:00:00',
        status: 'new'
    },
    {
        id: 'FB004',
        type: 'donor',
        name: 'Deepa Niroula',
        message: 'Very professional team. Would donate again!',
        rating: 4,
        createdAt: '2024-04-21T10:30:00',
        status: 'new'
    },
    {
        id: 'FB005',
        type: 'patient',
        name: 'Anita Gurung',
        message: 'Critical situation handled perfectly. Thank you!',
        rating: 5,
        createdAt: '2024-04-21T11:00:00',
        status: 'new'
    }
];
const hospitalsData = [
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
            'AB-': 0
        },
        contactPerson: 'Dr. Poonam Joshi',
        phone: '+977-1-4123456'
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
            'AB-': 1
        },
        contactPerson: 'Dr. Arjun Rai',
        phone: '+977-1-4987654'
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
            'AB-': 0
        },
        contactPerson: 'Dr. Kiran Shrestha',
        phone: '+977-1-5555555'
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
            'AB-': 0
        },
        contactPerson: 'Dr. Raj Poudel',
        phone: '+977-1-4414775'
    }
];
const usersData = [
    {
        id: 'U001',
        name: 'Admin User',
        email: 'admin@hamrolife.org',
        role: 'admin',
        joinedAt: '2024-01-01',
        isActive: true
    },
    {
        id: 'U002',
        name: 'Sharma Call Operator',
        email: 'operator@hamrolife.org',
        role: 'call_operator',
        joinedAt: '2024-02-15',
        isActive: true
    },
    {
        id: 'U003',
        name: 'Volunteer Coordinator',
        email: 'volunteer@hamrolife.org',
        role: 'volunteer',
        joinedAt: '2024-03-01',
        isActive: true
    },
    {
        id: 'U004',
        name: 'Poudel Call Operator',
        email: 'operator2@hamrolife.org',
        role: 'call_operator',
        joinedAt: '2024-01-20',
        isActive: false
    }
];
const getUrgencyColor = (urgency)=>{
    switch(urgency){
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
const getStatusColor = (status)=>{
    switch(status){
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/lib/blood-bank-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BloodBankProvider",
    ()=>BloodBankProvider,
    "useBloodBank",
    ()=>useBloodBank
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$dummy$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/dummy-data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const BloodBankContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function BloodBankProvider({ children }) {
    _s();
    const [requests, setRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$dummy$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requestsData"]);
    const [donors, setDonors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$dummy$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["donorsData"]);
    const [feedback, setFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$dummy$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["feedbackData"]);
    const [hospitals, setHospitals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$dummy$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hospitalsData"]);
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$dummy$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usersData"]);
    // Request handlers
    const updateRequest = (id, data)=>{
        setRequests((prev)=>prev.map((req)=>req.id === id ? {
                    ...req,
                    ...data
                } : req));
    };
    const deleteRequest = (id)=>{
        setRequests((prev)=>prev.filter((req)=>req.id !== id));
    };
    const addRequest = (request)=>{
        setRequests((prev)=>[
                request,
                ...prev
            ]);
    };
    // Donor handlers
    const updateDonor = (id, data)=>{
        setDonors((prev)=>prev.map((donor)=>donor.id === id ? {
                    ...donor,
                    ...data
                } : donor));
    };
    const deleteDonor = (id)=>{
        setDonors((prev)=>prev.filter((donor)=>donor.id !== id));
    };
    const addDonor = (donor)=>{
        setDonors((prev)=>[
                donor,
                ...prev
            ]);
    };
    // Feedback handlers
    const updateFeedback = (id, data)=>{
        setFeedback((prev)=>prev.map((fb)=>fb.id === id ? {
                    ...fb,
                    ...data
                } : fb));
    };
    const deleteFeedback = (id)=>{
        setFeedback((prev)=>prev.filter((fb)=>fb.id !== id));
    };
    const addFeedback = (newFeedback)=>{
        const feedbackWithId = {
            ...newFeedback,
            id: `FB${Date.now()}`
        };
        setFeedback((prev)=>[
                feedbackWithId,
                ...prev
            ]);
    };
    // Hospital handlers
    const updateHospital = (id, data)=>{
        setHospitals((prev)=>prev.map((hospital)=>hospital.id === id ? {
                    ...hospital,
                    ...data
                } : hospital));
    };
    const addHospital = (hospital)=>{
        setHospitals((prev)=>[
                hospital,
                ...prev
            ]);
    };
    // User handlers
    const updateUser = (id, data)=>{
        setUsers((prev)=>prev.map((user)=>user.id === id ? {
                    ...user,
                    ...data
                } : user));
    };
    const deleteUser = (id)=>{
        setUsers((prev)=>prev.filter((user)=>user.id !== id));
    };
    const addUser = (user)=>{
        setUsers((prev)=>[
                user,
                ...prev
            ]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BloodBankContext.Provider, {
        value: {
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
            addUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/lib/blood-bank-context.tsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
_s(BloodBankProvider, "Oq7PAuufnLEj4AHSQV6HnIjOJpo=");
_c = BloodBankProvider;
function useBloodBank() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(BloodBankContext);
    if (context === undefined) {
        throw new Error('useBloodBank must be used within BloodBankProvider');
    }
    return context;
}
_s1(useBloodBank, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "BloodBankProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/lib/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
// Dummy users for authentication
const dummyUsers = [
    {
        id: 'U001',
        name: 'Admin User',
        email: 'admin@hamrolife.org',
        password: 'admin123',
        role: 'admin'
    },
    {
        id: 'U002',
        name: 'Volunteer User',
        email: 'volunteer@hamrolife.org',
        password: 'volunteer123',
        role: 'volunteer'
    }
];
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            // Check for saved session on mount
            const savedUser = localStorage.getItem('hamro_life_user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch  {
                    localStorage.removeItem('hamro_life_user');
                }
            }
            setIsLoading(false);
        }
    }["AuthProvider.useEffect"], []);
    const login = async (email, password)=>{
        // Simulate API delay
        await new Promise((resolve)=>setTimeout(resolve, 800));
        const foundUser = dummyUsers.find((u)=>u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            localStorage.setItem('hamro_life_user', JSON.stringify(userWithoutPassword));
            return true;
        }
        return false;
    };
    const loginWithGoogle = async ()=>{
        // Simulate Google OAuth flow with a delay
        await new Promise((resolve)=>setTimeout(resolve, 1000));
        // For demo purposes, automatically sign in as admin with Google
        const googleUser = {
            id: 'GOOGLE_' + Date.now(),
            name: 'Google User',
            email: 'user@gmail.com',
            role: 'admin',
            avatar: undefined
        };
        setUser(googleUser);
        localStorage.setItem('hamro_life_user', JSON.stringify(googleUser));
        return true;
    };
    const logout = ()=>{
        setUser(null);
        localStorage.removeItem('hamro_life_user');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            loginWithGoogle,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/lib/auth-context.tsx",
        lineNumber: 101,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "YajQB7LURzRD+QP5gw0+K2TZIWA=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_web_lib_0eebkqi._.js.map