'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { addDays, startOfDay } from 'date-fns';
import { CreateRequestSchema } from '@/schemas';
import { useRouter } from 'next/navigation';
import { useCreateDiagnosisMutation, useDiagnosesQuery, useCreateRequestMutation, useHospitalsQuery, useRequestQuery, useUpdateRequestMutation } from '@/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { DualDatePicker } from '@/components/ui/dual-date-picker';
import type { Request } from '@/lib/dummy-data';
import type { HospitalOption } from '@/lib/routes';
import { Building2, ChevronDown, ChevronsUpDown, Check, Image as ImageIcon, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Request as ApiRequest } from '@/types';

const bloodComponents = [
  { id: 'prbc', label: 'PRBC', fullName: 'Packed Red Blood Cell' },
  { id: 'ffp', label: 'FFP', fullName: 'Fresh Frozen Plasma' },
  { id: 'prp', label: 'PRP', fullName: 'Platelet Rich Plasma' },
  { id: 'wb', label: 'WB', fullName: 'Whole blood' },
  { id: 'cry', label: 'CRY', fullName: 'Cryoprecipitate' },
  { id: 'pc', label: 'PC', fullName: 'Platelet Concentrate' },
  { id: 'sdp', label: 'SDP', fullName: 'Single Donor Platelets' },
  { id: 'fb', label: 'FB', fullName: 'Fresh Blood' },
];

const requestReceivedFromOptions = [
  'Direct Call',
  'Website',
  'Facebook',
  'Instagram',
  'Viber',
  'Whatsapp',
  'Others',
];

const requestManagedFromOptions = [
  'BloodBank',
  'Donor',
  'Both',
  'Themselves',
  'Others',
];

const patientFeedbackStatusOptions = [
  'Received',
  'Pending',
  "Haven't Contacted",
];

const insideValleyLocations = ['Kathmandu', 'Patan', 'Bhaktapur', 'Lalitpur'];

function resolveRequestLocation(hospital: string): Request['location'] {
  return insideValleyLocations.some((location) =>
    hospital.toLowerCase().includes(location.toLowerCase())
  )
    ? 'inside_valley'
    : 'outside_valley';
}

function hospitalLabel(h: { name: string; location: string }) {
  return h.location ? `${h.name} — ${h.location}` : h.name;
}

type RequestFormMode = 'create' | 'edit';
type RequestFormImage = { file?: File; name?: string; preview: string };

type RequestFormData = {
  patientName: string;
  requesterName: string;
  requesterPhone: string;
  diagnosis: string;
  hospitalId: string;
  hospital: string;
  hospitalValley: HospitalOption['valley'] | undefined;
  bloodType: string;
  bloodRequiredOn: string;
  totalPints: string;
  status: Request['status'];
  urgency: Request['urgency'];
  transportationRequired: 'yes' | 'no' | 'maybe';
  selectedComponents: string[];
  componentQuantities: Record<string, string>;
  additionalNotes: string;
  images: RequestFormImage[];
  requestReceivedFrom: string;
  requestManagedFrom: string;
  requestorEmail: string;
  patientFeedbackStatus: string;
  requisitionFormUpload: { file?: File; name: string } | null;
};

function emptyFormData(): RequestFormData {
  return {
    patientName: '',
    requesterName: '',
    requesterPhone: '',
    diagnosis: '',
    hospitalId: '',
    hospital: '',
    hospitalValley: undefined,
    bloodType: '',
    bloodRequiredOn: '',
    totalPints: '',
    status: 'pending',
    urgency: 'high',
    transportationRequired: 'no',
    selectedComponents: [],
    componentQuantities: {},
    additionalNotes: '',
    images: [],
    requestReceivedFrom: '',
    requestManagedFrom: '',
    requestorEmail: '',
    patientFeedbackStatus: '',
    requisitionFormUpload: null,
  };
}

function requestToFormData(request: ApiRequest): RequestFormData {
  const componentQuantities = Object.fromEntries(
    Object.entries(request.componentQuantities ?? {}).map(([key, value]) => [key, String(value)])
  );

  return {
    patientName: request.patientName ?? '',
    requesterName: request.requesterName ?? request.contactPerson ?? '',
    requesterPhone: request.requesterPhone ?? request.phone ?? '',
    diagnosis: request.diagnosis ?? '',
    hospitalId: request.hospitalId ?? '',
    hospital: request.hospital ?? '',
    hospitalValley: request.location,
    bloodType: request.bloodType ?? '',
    bloodRequiredOn: request.neededBy ? request.neededBy.split('T')[0] : '',
    totalPints: String(request.quantity || ''),
    status: request.status,
    urgency: request.urgency,
    transportationRequired: request.transportationRequired ?? 'no',
    selectedComponents: request.selectedComponents ?? [],
    componentQuantities,
    additionalNotes: request.notes ?? '',
    images: (request.images ?? []).map((image) => ({
      name: image.name,
      preview: image.preview ?? '/placeholder.svg',
    })),
    requestReceivedFrom: request.requestReceivedFrom ?? '',
    requestManagedFrom: request.requestManagedFrom ?? '',
    requestorEmail: request.requestorEmail ?? '',
    patientFeedbackStatus: request.patientFeedbackStatus ?? '',
    requisitionFormUpload: request.requisitionFormUpload?.name
      ? { name: request.requisitionFormUpload.name }
      : null,
  };
}

export function NewRequestPageContent({
  mode = 'create',
  requestId,
}: {
  mode?: RequestFormMode;
  requestId?: string;
} = {}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const isEdit = mode === 'edit';
  const createRequest = useCreateRequestMutation();
  const updateRequest = useUpdateRequestMutation(requestId ?? '');
  const { data: diagnoses = [] } = useDiagnosesQuery();
  const createDiagnosisMutation = useCreateDiagnosisMutation();
  const {
    data: request,
    isLoading: isRequestLoading,
    isError: isRequestError,
  } = useRequestQuery(requestId, { enabled: isEdit });
  const { data: hospitals = [] } = useHospitalsQuery();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const patientNameRef = useRef<HTMLInputElement | null>(null);
  const requesterPhoneRef = useRef<HTMLInputElement | null>(null);
  const hospitalTriggerRef = useRef<HTMLButtonElement | null>(null);
  const bloodTypeRef = useRef<HTMLDivElement | null>(null);
  const totalPintsRef = useRef<HTMLInputElement | null>(null);
  const [additionalDetailsOpen, setAdditionalDetailsOpen] = useState(false);
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);
  const [hospitalOpen, setHospitalOpen] = useState(false);
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [isDiagnosisDialogOpen, setIsDiagnosisDialogOpen] = useState(false);
  const [newDiagnosisName, setNewDiagnosisName] = useState('');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requisitionInputRef = useRef<HTMLInputElement>(null);
  const bloodRequiredMinDate = startOfDay(addDays(new Date(), -1));
  const diagnosisOptions = useMemo(
    () => diagnoses.map((item) => item.name).sort((a, b) => a.localeCompare(b)),
    [diagnoses]
  );

  // cache single-field schemas for optimized per-field validation
  const fieldSchemas = useMemo(() => {
    const s: Record<string, any> = {};
    const keys = [
      'patientName',
      'requesterName',
      'requesterPhone',
      'diagnosis',
      'hospital',
      'bloodType',
      'bloodRequiredOn',
      'totalPints',
      'status',
      'urgency',
      'transportationRequired',
      'selectedComponents',
      'componentQuantities',
      'additionalNotes',
      'requestReceivedFrom',
      'requestManagedFrom',
      'requestorEmail',
      'patientFeedbackStatus',
      'requisitionFormUpload',
    ];
    keys.forEach((k) => {
      try {
        // @ts-ignore
        s[k] = (CreateRequestSchema as any).pick({ [k]: true });
      } catch (e) {
        // ignore
      }
    });
    return s;
  }, []);

  // helper to update form fields and validate the single field (optimized)
  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    const schema = fieldSchemas[key];
    if (!schema) {
      setErrors((prev) => {
        if (!prev || !(key in prev)) return prev;
        const next = { ...prev } as Record<string, string>;
        delete next[key];
        return next;
      });
      return;
    }
    const res = schema.safeParse({ [key]: value });
    if (res.success) {
      setErrors((prev) => {
        if (!prev || !(key in prev)) return prev;
        const next = { ...prev } as Record<string, string>;
        delete next[key];
        return next;
      });
    } else {
      const flat = res.error.flatten();
      const err = flat.fieldErrors[key];
      setErrors((prev) => ({ ...(prev || {}), [key]: err && err[0] ? (err[0] as string) : 'Invalid' }));
    }
  };

  const validateField = (key: string, value: any) => {
    try {
      // @ts-ignore
      const fieldSchema = (CreateRequestSchema as any).pick({ [key]: true });
      const res = fieldSchema.safeParse({ [key]: value });
      if (res.success) {
        setErrors((prev) => {
          if (!prev || !(key in prev)) return prev;
          const next = { ...prev } as Record<string, string>;
          delete next[key];
          return next;
        });
      } else {
        const flat = res.error.flatten();
        const err = flat.fieldErrors[key];
        setErrors((prev) => ({ ...(prev || {}), [key]: err && err[0] ? (err[0] as string) : 'Invalid' }));
      }
    } catch (e) {
      // ignore
    }
  };

  const [formData, setFormData] = useState<RequestFormData>(() => emptyFormData());

  const filteredHospitals = useMemo(() => {
    const q = hospitalSearch.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter((h) => `${h.name} ${h.location}`.toLowerCase().includes(q));
  }, [hospitals, hospitalSearch]);

  useEffect(() => {
    if (!isEdit && !formData.hospital && hospitals.length === 1) {
      setFormData((prev) => ({
        ...prev,
        hospitalId: hospitals[0].id,
        hospital: hospitalLabel(hospitals[0]),
        hospitalValley: hospitals[0].valley,
      }));
    }
  }, [formData.hospital, hospitals, isEdit]);

  useEffect(() => {
    if (!isEdit || !request) return;
    // Reset form first to avoid leftover controlled input state (Radix Select showing previous value)
    setFormData(emptyFormData());
    // Populate with request data
    setTimeout(() => {
      setFormData(requestToFormData(request));
      setErrors({});
      setAdditionalDetailsOpen(true);
    }, 0);
  }, [isEdit, request]);

  const handleSelectHospital = (h: HospitalOption) => {
    setFormData((prev) => ({
      ...prev,
      hospitalId: h.id,
      hospital: hospitalLabel(h),
      hospitalValley: h.valley,
    }));
    setHospitalOpen(false);
  };

  const handleComponentToggle = (componentId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedComponents.includes(componentId);
      const nextSelected = isSelected
        ? prev.selectedComponents.filter((id) => id !== componentId)
        : [...prev.selectedComponents, componentId];

      const nextQuantities = { ...prev.componentQuantities };
      if (isSelected) {
        delete nextQuantities[componentId];
      } else if (!nextQuantities[componentId]) {
        nextQuantities[componentId] = '1';
      }


      // clear totalPints validation error when components change
      setErrors((prev) => {
        if (!prev || !prev.totalPints) return prev;
        const next = { ...prev } as Record<string, string>;
        delete next.totalPints;
        return next;
      });

      // validate selectedComponents and componentQuantities fields
      setTimeout(() => {
        try {
          validateField('selectedComponents', nextSelected);
        } catch {}
        try {
          validateField('componentQuantities', nextQuantities);
        } catch {}
      }, 0);

      return {
        ...prev,
        selectedComponents: nextSelected,
        componentQuantities: nextQuantities,
      };
    });
  };

  const handleComponentQuantityChange = (componentId: string, qty: string) => {
    const next = {
      ...formData.componentQuantities,
      [componentId]: qty,
    };
    updateField('componentQuantities', next);
    // clear totalPints validation error when quantities change
    setErrors((prev) => {
      if (!prev || !prev.totalPints) return prev;
      const nextErr = { ...prev } as Record<string, string>;
      delete nextErr.totalPints;
      return nextErr;
    });
  };

  // Auto-update total pints when component quantities change
  useEffect(() => {
    const total = formData.selectedComponents.reduce((sum, id) => {
      const qty = parseInt(formData.componentQuantities[id] || '0', 10);
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);
    if (total > 0) {
      setFormData((prev) =>
        prev.totalPints === String(total) ? prev : { ...prev, totalPints: String(total) }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.componentQuantities, formData.selectedComponents]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5),
      }));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      if (prev.images[index].file) URL.revokeObjectURL(prev.images[index].preview);
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      };
    });
  };

  const handleRequisitionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({
      ...prev,
      requisitionFormUpload: file ? { file, name: file.name } : prev.requisitionFormUpload,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Map form data to the shared CreateRequestInput shape
    const payload = {
      patientName: formData.patientName,
      requesterName: formData.requesterName,
      requesterPhone: formData.requesterPhone,
      diagnosis: formData.diagnosis,
      hospitalId: formData.hospitalId || undefined,
      hospital: formData.hospital,
      bloodType: formData.bloodType,
      bloodRequiredOn: formData.bloodRequiredOn,
      totalPints: formData.totalPints ? Number(formData.totalPints) : undefined,
      status: formData.additionalNotes && formData.additionalNotes.trim() !== '' ? 'fulfilled' : formData.status,
      urgency: formData.urgency,
      transportationRequired: formData.transportationRequired,
      selectedComponents: formData.selectedComponents,
      componentQuantities: Object.fromEntries(
        Object.entries(formData.componentQuantities).map(([k, v]) => [k, Number(v)])
      ),
      additionalNotes: formData.additionalNotes || undefined,
      images: formData.images.length
        ? formData.images.map((i) => ({ name: i.file?.name ?? i.name, preview: i.preview }))
        : undefined,
      ...(isEdit
        ? {
            requestReceivedFrom: formData.requestReceivedFrom || undefined,
            requestManagedFrom: formData.requestManagedFrom || undefined,
            requestorEmail: formData.requestorEmail || undefined,
            patientFeedbackStatus: formData.patientFeedbackStatus || undefined,
            requisitionFormUpload: formData.requisitionFormUpload
              ? { name: formData.requisitionFormUpload.name }
              : undefined,
          }
        : {}),
      requestedAt: request?.requestedAt ?? new Date().toISOString(),
      neededBy:
        formData.bloodRequiredOn || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      location: formData.hospitalValley ?? resolveRequestLocation(formData.hospital),
    } as const;

    // validate payload with zod before sending
    const parsed = CreateRequestSchema.safeParse(payload as any);
    if (!parsed.success) {
      const issues = parsed.error.issues;
      const mapped: Record<string, string> = {};
      issues.forEach((issue) => {
        const key = issue.path?.[0] as string | undefined;
        if (key) mapped[key] = issue.message;
      });
      setErrors(mapped);
      // focus first invalid field
      const firstKey = Object.keys(mapped)[0];
      if (firstKey) {
        setTimeout(() => {
          switch (firstKey) {
            case 'patientName':
              patientNameRef.current?.focus();
              break;
            case 'requesterPhone':
              requesterPhoneRef.current?.focus();
              break;
            case 'hospital':
              hospitalTriggerRef.current?.focus();
              break;
            case 'bloodType':
              // focus select trigger
              bloodTypeRef.current?.querySelector('button')?.focus();
              break;
            case 'totalPints':
              totalPintsRef.current?.focus();
              break;
            default:
              break;
          }
        }, 50);
      }
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEdit) {
        await updateRequest.mutateAsync(payload as any);
      } else {
        await createRequest.mutateAsync(payload as any);
      }
      // cleanup previews
      formData.images.forEach((img) => {
        if (img.file) URL.revokeObjectURL(img.preview);
      });

      setFormData(emptyFormData());

      router.push('/requests');
    } catch (err) {
      // keep it simple: un-set submitting and allow UI to show errors via mutation state
      console.error(`${isEdit ? 'Update' : 'Create'} request failed`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDiagnosis = async () => {
    const diagnosisName = newDiagnosisName.trim();
    if (!diagnosisName) return;

    try {
      const createdDiagnosis = await createDiagnosisMutation.mutateAsync({ name: diagnosisName });
      updateField('diagnosis', createdDiagnosis.name);
      setNewDiagnosisName('');
      setIsDiagnosisDialogOpen(false);
      setDiagnosisOpen(false);
    } catch (error) {
      console.error('Failed to add diagnosis', error);
    }
  };

  if (isEdit && isRequestLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <Card className="border-border shadow-sm">
          <CardContent className="py-8 text-center text-muted-foreground">Loading request details...</CardContent>
        </Card>
      </div>
    );
  }

  if (isEdit && (isRequestError || !request)) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Request not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The requested item could not be found.</p>
            <div className="mt-4">
              <Button onClick={() => router.push('/requests')}>Back to requests</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-3 overflow-x-clip pb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Edit Blood Request' : 'Add Blood Request'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit ? 'Update request details and additional information.' : 'Create and manage a new blood donation request.'}
          </p>
        </div>
        <div className="w-fit rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          {isEdit ? `Editing ${request?.id}` : 'Spacious full-page request form'}
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-base font-semibold">Request Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-3.5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
              <div className="min-w-0 space-y-3">
              <section className="space-y-2.5 rounded-xl border bg-background/70 p-3 shadow-sm">
              <div>
                <h3 className="text-sm font-semibold">Patient &amp; Requester Information</h3>
                <p className="text-xs text-muted-foreground">Basic details for the request owner and contact person.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Field>
                  <FieldLabel className="text-xs font-medium">Patient Name:</FieldLabel>
                  <Input ref={patientNameRef} value={formData.patientName} onChange={(e) => updateField('patientName', e.target.value)} placeholder="Enter patient name" />
                  {errors.patientName && <p className="mt-1 text-xs text-destructive">{errors.patientName}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-xs font-medium">Requester Name:</FieldLabel>
                  <Input value={formData.requesterName} onChange={(e) => updateField('requesterName', e.target.value)} placeholder="Enter requester name" />
                  {errors.requesterName && <p className="mt-1 text-xs text-destructive">{errors.requesterName}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-xs font-medium">Requester Phone:</FieldLabel>
                  {isMobile ? (
                    <InputGroup>
                      <InputGroupAddon align="inline-start">+977</InputGroupAddon>
                      <InputGroupInput
                        type="tel"
                        inputMode="tel"
                        value={formData.requesterPhone}
                        ref={requesterPhoneRef}
                        onChange={(e) => updateField('requesterPhone', e.target.value)}
                        placeholder="98XXXXXXXX"
                      />
                    </InputGroup>
                  ) : (
                    <Input type="tel" value={formData.requesterPhone} onChange={(e) => updateField('requesterPhone', e.target.value)} placeholder="98XXXXXXXX" />
                  )}
                  {errors.requesterPhone && <p className="mt-1 text-xs text-destructive">{errors.requesterPhone}</p>}
                </Field>
              </div>
            </section>

              <section className="space-y-2.5 rounded-xl border bg-background/70 p-3 shadow-sm">
              <div>
                <h3 className="text-sm font-semibold">Diagnosis &amp; Hospital Details</h3>
                <p className="text-xs text-muted-foreground">Choose the source hospital and a diagnosis or reason for the request.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel className="text-xs font-medium">Diagnosis:</FieldLabel>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Popover open={diagnosisOpen} onOpenChange={setDiagnosisOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={diagnosisOpen} className="min-w-0 flex-1 justify-between text-sm font-normal">
                          {formData.diagnosis || 'Select or type...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[min(92vw,340px)] p-0">
                        <Command>
                          <CommandInput placeholder="Search or type..." value={customDiagnosis} onValueChange={setCustomDiagnosis} />
                          <CommandList>
                            <CommandEmpty>
                              <div className="px-3 py-2 text-xs text-muted-foreground">No matching disease found.</div>
                            </CommandEmpty>
                            <CommandGroup>
                              {diagnosisOptions.map((diagnosis) => (
                                <CommandItem key={diagnosis} value={diagnosis} onSelect={() => { updateField('diagnosis', diagnosis); setDiagnosisOpen(false); }}>
                                  <Check className={cn('mr-2 h-4 w-4', formData.diagnosis === diagnosis ? 'opacity-100' : 'opacity-0')} />
                                  {diagnosis}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      size="icon"
                      className="h-10 w-10 shrink-0 self-start bg-primary text-primary-foreground hover:bg-primary/90 sm:self-auto"
                      onClick={() => {
                        setNewDiagnosisName(customDiagnosis || formData.diagnosis || '');
                        setIsDiagnosisDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.diagnosis && <p className="mt-1 text-xs text-destructive">{errors.diagnosis}</p>}
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-medium">Hospital:</FieldLabel>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Popover open={hospitalOpen} onOpenChange={setHospitalOpen}>
                      <PopoverTrigger asChild>
                          <Button ref={hospitalTriggerRef} variant="outline" role="combobox" aria-expanded={hospitalOpen} className="min-w-0 flex-1 justify-between text-left text-sm font-normal">
                            <span className="truncate">{formData.hospital || 'Search hospital by name or location...'}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                      <PopoverContent className="w-[min(92vw,400px)] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput placeholder="Search by name or location..." value={hospitalSearch} onValueChange={setHospitalSearch} />
                          <CommandList>
                            <CommandEmpty>
                              <div className="px-2 py-3 text-sm text-muted-foreground">No hospital found.</div>
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredHospitals.map((h) => (
                                <CommandItem key={h.id} value={hospitalLabel(h)} onSelect={() => handleSelectHospital(h)} className="flex flex-col items-start gap-0.5">
                                  <div className="flex items-center w-full">
                                    <Check className={cn('mr-2 h-4 w-4', formData.hospital === hospitalLabel(h) ? 'opacity-100' : 'opacity-0')} />
                                    <span className="font-medium">{h.name}</span>
                                  </div>
                                  {h.location && <span className="ml-6 text-xs text-muted-foreground">{h.location}</span>}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button type="button" size="icon" variant="outline" className="h-10 w-10 shrink-0 self-start sm:self-auto" onClick={() => router.push('/hospitals?openForm=true')}>
                      <Building2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.hospital && <p className="mt-1 text-xs text-destructive">{errors.hospital}</p>}
                </Field>
              </div>
            </section>

              <section className="space-y-2.5 rounded-xl border bg-background/70 p-3 shadow-sm">
              <div>
                <h3 className="text-sm font-semibold">Blood Requirement Details</h3>
                <p className="text-xs text-muted-foreground">Set the blood group, deadline, quantity, urgency, and transport needs.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field>
                  <FieldLabel className="text-xs font-medium">Blood Group:</FieldLabel>
                  <div ref={bloodTypeRef}>
                    <Select value={formData.bloodType} onValueChange={(value) => updateField('bloodType', value)}>
                      <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select Option" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.bloodType && <p className="mt-1 text-xs text-destructive">{errors.bloodType}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-xs font-medium">Blood Required On:</FieldLabel>
                  <DualDatePicker
                    value={formData.bloodRequiredOn}
                    onChange={(value) => updateField('bloodRequiredOn', value)}
                    minDate={bloodRequiredMinDate}
                  />
                  {errors.bloodRequiredOn && <p className="mt-1 text-xs text-destructive">{errors.bloodRequiredOn}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-xs font-medium">Total Number of Pints Required:</FieldLabel>
                  <Input ref={totalPintsRef} type="number" min={1} value={formData.totalPints} onChange={(e) => updateField('totalPints', e.target.value)} placeholder="Enter qty." readOnly={formData.selectedComponents.length > 0} className={cn('h-10 text-sm', formData.selectedComponents.length > 0 && 'bg-muted/50 cursor-not-allowed')} />
                  {formData.selectedComponents.length > 0 && <p className="text-[11px] text-muted-foreground">Auto-calculated from blood components below</p>}
                  {errors.totalPints && <p className="mt-1 text-xs text-destructive">{errors.totalPints}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-xs font-medium">Blood Request Status:</FieldLabel>
                  <Select value={formData.status} onValueChange={(value: Request['status']) => updateField('status', value)}>
                    <SelectTrigger className="h-10 bg-primary text-sm text-primary-foreground border-primary hover:bg-primary/90"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="mt-1 text-xs text-destructive">{errors.status}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-xs font-medium">Urgency:</FieldLabel>
                  <Select value={formData.urgency} onValueChange={(value: Request['urgency']) => updateField('urgency', value)}>
                    <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">Urgent</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.urgency && <p className="mt-1 text-xs text-destructive">{errors.urgency}</p>}
                </Field>
                <Field>
                  <FieldLabel className="text-xs font-medium">Transportation Required:</FieldLabel>
                  <Select value={formData.transportationRequired} onValueChange={(value) => updateField('transportationRequired', value)}>
                    <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select Option" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="maybe">If Needed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.transportationRequired && <p className="mt-1 text-xs text-destructive">{errors.transportationRequired}</p>}
                </Field>
              </div>
            </section>
              </div>

            <div className="min-w-0 space-y-3">
            <section className="space-y-2.5 rounded-xl border bg-background/70 p-3 shadow-sm">
              <div>
                <h3 className="text-sm font-semibold">Blood Components</h3>
                <p className="text-xs text-muted-foreground">Select the required components and quantities in a compact grid.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {bloodComponents.map((component) => {
                  const isChecked = formData.selectedComponents.includes(component.id);
                    return (
                    <div key={component.id} className={cn('flex min-w-0 flex-col gap-2 rounded-md border px-3 py-2.5 transition-colors sm:flex-row sm:items-center', isChecked ? 'border-primary/20 bg-primary/10' : 'bg-background')}>
                      <Checkbox id={component.id} checked={isChecked} onCheckedChange={() => handleComponentToggle(component.id)} />
                      <label htmlFor={component.id} className="min-w-0 flex-1 cursor-pointer text-sm font-medium leading-tight break-words">{component.label} ({component.fullName})</label>
                      {isChecked && (
                        <div className="flex items-center gap-1.5 sm:justify-end">
                          <label htmlFor={`qty-${component.id}`} className="text-[11px] text-muted-foreground">Qty:</label>
                          <Input id={`qty-${component.id}`} type="number" min={1} value={formData.componentQuantities[component.id] || ''} onChange={(e) => handleComponentQuantityChange(component.id, e.target.value)} className="h-8 w-16 text-xs" placeholder="0" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {formData.selectedComponents.length > 0 && (
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className="text-muted-foreground">Total Pints:</span>
                  <span className="font-semibold text-primary">{formData.totalPints || '0'}</span>
                </div>
              )}
              {errors.selectedComponents && <p className="text-xs text-destructive">{errors.selectedComponents}</p>}
              {errors.componentQuantities && <p className="text-xs text-destructive">{errors.componentQuantities}</p>}
            </section>

            {!isEdit && (
              <section className="space-y-2.5 rounded-xl border bg-background/70 p-3 shadow-sm">
                <div>
                  <h3 className="text-sm font-semibold">Upload Images</h3>
                  <p className="text-xs text-muted-foreground">Attach supporting documents or photos if needed.</p>
                </div>
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-2.5">
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
                  {formData.images.length > 0 ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {formData.images.map((img, index) => (
                          <div key={index} className="group relative aspect-square overflow-hidden rounded-md border border-border">
                            <img src={img.preview || '/placeholder.svg'} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                            <button type="button" onClick={() => removeImage(index)} className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {formData.images.length < 5 && (
                          <label htmlFor="image-upload" className="aspect-square cursor-pointer rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-1 transition-colors hover:border-primary/50 hover:bg-muted/50">
                            <Plus className="h-5 w-5 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">Add</span>
                          </label>
                        )}
                      </div>
                      <p className="text-center text-[11px] text-muted-foreground">{formData.images.length}/5 images uploaded</p>
                    </div>
                  ) : (
                    <label htmlFor="image-upload" className="flex cursor-pointer flex-col items-center justify-center py-4">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="mb-1 text-xs font-medium text-foreground">Click to upload images</p>
                      <p className="text-[11px] text-muted-foreground">PNG, JPG up to 5 images (prescription, reports, etc.)</p>
                    </label>
                  )}
                </div>
              </section>
            )}

            <section className="space-y-2.5 rounded-xl border bg-background/70 p-3 shadow-sm">
              <Collapsible open={additionalDetailsOpen} onOpenChange={setAdditionalDetailsOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex cursor-pointer items-center justify-between rounded-md border bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                    <span className="text-sm font-semibold">Additional Details</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${additionalDetailsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  {isEdit ? (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field>
                          <FieldLabel className="text-xs font-medium">Request Received From:</FieldLabel>
                          <Select value={formData.requestReceivedFrom} onValueChange={(value) => updateField('requestReceivedFrom', value)}>
                            <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Received From" /></SelectTrigger>
                            <SelectContent>
                              {requestReceivedFromOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs font-medium">Request Managed From:</FieldLabel>
                          <Select value={formData.requestManagedFrom} onValueChange={(value) => updateField('requestManagedFrom', value)}>
                            <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="-- Select One --" /></SelectTrigger>
                            <SelectContent>
                              {requestManagedFromOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs font-medium">Requestor Email:</FieldLabel>
                          <Input type="email" value={formData.requestorEmail} onChange={(e) => updateField('requestorEmail', e.target.value)} />
                          {errors.requestorEmail && <p className="mt-1 text-xs text-destructive">{errors.requestorEmail}</p>}
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs font-medium">Patient Feedback Status:</FieldLabel>
                          <Select value={formData.patientFeedbackStatus} onValueChange={(value) => updateField('patientFeedbackStatus', value)}>
                            <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="-- Select One --" /></SelectTrigger>
                            <SelectContent>
                              {patientFeedbackStatusOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                      <Field>
                        <FieldLabel className="text-xs font-medium">Remarks:</FieldLabel>
                        <Textarea value={formData.additionalNotes} onChange={(e) => updateField('additionalNotes', e.target.value)} placeholder="Enter text here..." rows={4} />
                        {errors.additionalNotes && <p className="mt-1 text-xs text-destructive">{errors.additionalNotes}</p>}
                      </Field>
                      <Field>
                        <FieldLabel className="text-xs font-medium">Requisition Form Upload:</FieldLabel>
                        <Input ref={requisitionInputRef} type="file" onChange={handleRequisitionUpload} />
                        {formData.requisitionFormUpload?.name && (
                          <p className="text-[11px] text-muted-foreground">Selected: {formData.requisitionFormUpload.name}</p>
                        )}
                      </Field>
                    </div>
                  ) : (
                    <Field>
                      <FieldLabel className="text-xs font-medium">Remarks:</FieldLabel>
                      <Textarea value={formData.additionalNotes} onChange={(e) => updateField('additionalNotes', e.target.value)} placeholder="Enter text here..." rows={4} />
                      {errors.additionalNotes && <p className="mt-1 text-xs text-destructive">{errors.additionalNotes}</p>}
                    </Field>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </section>
            </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t pt-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => router.push('/requests')}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? (isEdit ? 'Saving...' : 'Submitting...') : (isEdit ? 'Save Changes' : 'Submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isDiagnosisDialogOpen} onOpenChange={setIsDiagnosisDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Disease</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Field>
              <FieldLabel className="text-xs font-medium">Disease Name:</FieldLabel>
              <Input
                value={newDiagnosisName}
                onChange={(e) => setNewDiagnosisName(e.target.value)}
                placeholder="Enter disease name"
                autoFocus
              />
            </Field>
          </div>
          <DialogFooter className="mt-4 flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsDiagnosisDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddDiagnosis}
              disabled={!newDiagnosisName.trim() || createDiagnosisMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
