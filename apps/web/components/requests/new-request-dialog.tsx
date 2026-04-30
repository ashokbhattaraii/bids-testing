'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useBloodBank } from '@/lib/blood-bank-context';
import type { Request, Hospital } from '@/lib/dummy-data';
import { Field, FieldLabel } from '@/components/ui/field';
import { DualDatePicker } from '@/components/ui/dual-date-picker';
import {
  Plus,
  ChevronDown,
  X,
  Image as ImageIcon,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRequest?: Request | null;
}

const bloodComponents = [
  { id: 'prbc', label: 'PRBC', fullName: 'Packed Red Blood Cell' },
  { id: 'ffp', label: 'FFP', fullName: 'Fresh Frozen Plasma' },
  { id: 'prp', label: 'PRP', fullName: 'Platelet Rich Plasma' },
  { id: 'wb', label: 'WB', fullName: 'Whole blood' },
  { id: 'cry', label: 'CRY', fullName: 'Cryoprecipitate' },
  { id: 'pc', label: 'PC', fullName: 'Platelet Concentrate' },
];

const diagnosisOptions = [
  'Accident/Trauma',
  'Surgery',
  'Anemia',
  'Cancer Treatment',
  'Blood Disorder',
  'Pregnancy Complication',
  'Kidney Disease',
  'Liver Disease',
  'Heart Surgery',
  'Burn Treatment',
  'Dengue',
  'Thalassemia',
  'Hemophilia',
  'Other',
];

// Display helper: merge name + location into a single label
function hospitalLabel(h: { name: string; location: string }) {
  return h.location ? `${h.name} — ${h.location}` : h.name;
}

export function NewRequestDialog({
  open,
  onOpenChange,
  editRequest,
}: NewRequestDialogProps) {
  const { addRequest, updateRequest, hospitals, addHospital } = useBloodBank();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalDetailsOpen, setAdditionalDetailsOpen] = useState(false);
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);
  const [hospitalOpen, setHospitalOpen] = useState(false);
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [addHospitalOpen, setAddHospitalOpen] = useState(false);
  const [newHospitalName, setNewHospitalName] = useState('');
  const [newHospitalLocation, setNewHospitalLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editRequest;

  const [formData, setFormData] = useState({
    patientName: editRequest?.patientName || '',
    requesterName: editRequest?.contactPerson || '',
    requesterPhone: editRequest?.phone || '',
    diagnosis: '',
    hospital: editRequest?.hospital || '',
    bloodType: editRequest?.bloodType || '',
    bloodRequiredOn: editRequest?.neededBy
      ? editRequest.neededBy.split('T')[0]
      : '',
    totalPints: editRequest?.quantity?.toString() || '',
    status: editRequest?.status || ('pending' as Request['status']),
    urgency: editRequest?.urgency || ('high' as Request['urgency']),
    transportationRequired: '',
    selectedComponents: [] as string[],
    componentQuantities: {} as Record<string, string>,
    additionalNotes: editRequest?.notes || '',
    images: [] as { file: File; preview: string }[],
  });

  // Reset form when dialog opens with edit request
  useEffect(() => {
    if (editRequest) {
      setFormData({
        patientName: editRequest.patientName,
        requesterName: editRequest.contactPerson,
        requesterPhone: editRequest.phone,
        diagnosis: '',
        hospital: editRequest.hospital,
        bloodType: editRequest.bloodType,
        bloodRequiredOn: editRequest.neededBy.split('T')[0],
        totalPints: editRequest.quantity.toString(),
        status: editRequest.status,
        urgency: editRequest.urgency,
        transportationRequired: '',
        selectedComponents: [],
        componentQuantities: {},
        additionalNotes: editRequest.notes,
        images: [],
      });
    }
  }, [editRequest]);

  // Auto-update total pints when component quantities change
  useEffect(() => {
    const total = formData.selectedComponents.reduce((sum, id) => {
      const qty = parseInt(formData.componentQuantities[id] || '0', 10);
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);
    if (total > 0) {
      setFormData((prev) =>
        prev.totalPints === String(total)
          ? prev
          : { ...prev, totalPints: String(total) }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.componentQuantities, formData.selectedComponents]);

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

      return {
        ...prev,
        selectedComponents: nextSelected,
        componentQuantities: nextQuantities,
      };
    });
  };

  const handleComponentQuantityChange = (componentId: string, qty: string) => {
    setFormData((prev) => ({
      ...prev,
      componentQuantities: {
        ...prev.componentQuantities,
        [componentId]: qty,
      },
    }));
  };

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
      URL.revokeObjectURL(prev.images[index].preview);
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      };
    });
  };

  const handleSelectHospital = (h: Hospital) => {
    setFormData({ ...formData, hospital: hospitalLabel(h) });
    setHospitalOpen(false);
  };

  const filteredHospitals = useMemo(() => {
    const q = hospitalSearch.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter((h) =>
      `${h.name} ${h.location}`.toLowerCase().includes(q)
    );
  }, [hospitals, hospitalSearch]);

  const handleAddHospital = () => {
    const name = newHospitalName.trim();
    const location = newHospitalLocation.trim();
    if (!name) return;
    const emptyInventory = {
      'O+': 0,
      'O-': 0,
      'A+': 0,
      'A-': 0,
      'B+': 0,
      'B-': 0,
      'AB+': 0,
      'AB-': 0,
    } as const;
    const newHospital: Hospital = {
      id: `H${Date.now()}`,
      name,
      location,
      bloodInventory: { ...emptyInventory },
      contactPerson: '',
      phone: '',
    };
    addHospital(newHospital);
    setFormData({ ...formData, hospital: hospitalLabel(newHospital) });
    setNewHospitalName('');
    setNewHospitalLocation('');
    setAddHospitalOpen(false);
    setHospitalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isEditing && editRequest) {
      // Update existing request
      updateRequest(editRequest.id, {
        patientName: formData.patientName,
        hospital: formData.hospital,
        bloodType: formData.bloodType || 'O+',
        quantity: parseInt(formData.totalPints) || 1,
        urgency: formData.urgency,
        notes: formData.additionalNotes,
        contactPerson: formData.requesterName,
        phone: formData.requesterPhone,
        status: formData.status,
        neededBy:
          formData.bloodRequiredOn ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    } else {
      // Create new request
      const newRequest: Request = {
        id: `REQ${String(Date.now()).slice(-6)}`,
        patientName: formData.patientName,
        hospital: formData.hospital,
        bloodType: formData.bloodType || 'O+',
        quantity: parseInt(formData.totalPints) || 1,
        urgency: formData.urgency,
        notes: formData.additionalNotes,
        contactPerson: formData.requesterName,
        phone: formData.requesterPhone,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        neededBy:
          formData.bloodRequiredOn ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      addRequest(newRequest);
    }

    formData.images.forEach((img) => URL.revokeObjectURL(img.preview));

    // Reset form
    setFormData({
      patientName: '',
      requesterName: '',
      requesterPhone: '',
      diagnosis: '',
      hospital: '',
      bloodType: '',
      bloodRequiredOn: '',
      totalPints: '',
      status: 'pending',
      urgency: 'high',
      transportationRequired: '',
      selectedComponents: [],
      componentQuantities: {},
      additionalNotes: '',
      images: [],
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? 'Edit Request' : 'Add a Request'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-5">
            {/* Row 1: Patient Name, Requester Name, Requester Phone */}
            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel>Patient Name:</FieldLabel>
                <Input
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData({ ...formData, patientName: e.target.value })
                  }
                  placeholder=""
                />
              </Field>

              <Field>
                <FieldLabel>Requester Name:</FieldLabel>
                <Input
                  value={formData.requesterName}
                  onChange={(e) =>
                    setFormData({ ...formData, requesterName: e.target.value })
                  }
                  placeholder=""
                />
              </Field>

              <Field>
                <FieldLabel>Requester Phone:</FieldLabel>
                <Input
                  type="tel"
                  value={formData.requesterPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requesterPhone: e.target.value,
                    })
                  }
                  placeholder=""
                />
              </Field>
            </div>

            {/* Row 2: Diagnosis, Hospital (merged with location) */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Diagnosis:</FieldLabel>
                <div className="flex gap-2">
                  <Popover
                    open={diagnosisOpen}
                    onOpenChange={setDiagnosisOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={diagnosisOpen}
                        className="flex-1 justify-between font-normal"
                      >
                        {formData.diagnosis || 'Select or type...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search or type..."
                          value={customDiagnosis}
                          onValueChange={setCustomDiagnosis}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  diagnosis: customDiagnosis,
                                });
                                setDiagnosisOpen(false);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add &quot;{customDiagnosis}&quot;
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {diagnosisOptions.map((diagnosis) => (
                              <CommandItem
                                key={diagnosis}
                                value={diagnosis}
                                onSelect={() => {
                                  setFormData({ ...formData, diagnosis });
                                  setDiagnosisOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    formData.diagnosis === diagnosis
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
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
                    className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
                    onClick={() => setDiagnosisOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel>Hospital:</FieldLabel>
                <div className="flex gap-2">
                  <Popover open={hospitalOpen} onOpenChange={setHospitalOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={hospitalOpen}
                        className="flex-1 justify-between font-normal text-left"
                      >
                        <span className="truncate">
                          {formData.hospital || 'Search hospital by name or location...'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[380px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search by name or location..."
                          value={hospitalSearch}
                          onValueChange={setHospitalSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                              No hospital found.
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredHospitals.map((h) => (
                              <CommandItem
                                key={h.id}
                                value={hospitalLabel(h)}
                                onSelect={() => handleSelectHospital(h)}
                                className="flex flex-col items-start gap-0.5"
                              >
                                <div className="flex items-center w-full">
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      formData.hospital === hospitalLabel(h)
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  <span className="font-medium">{h.name}</span>
                                </div>
                                {h.location && (
                                  <span className="ml-6 text-xs text-muted-foreground">
                                    {h.location}
                                  </span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                        <div className="border-t p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start text-emerald-600 hover:text-emerald-700"
                            onClick={() => setAddHospitalOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add new hospital
                          </Button>
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    size="icon"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
                    onClick={() => {
                      setHospitalOpen(true);
                      setAddHospitalOpen(true);
                    }}
                    aria-label="Add new hospital"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
            </div>

            {/* Row 3: Blood Group, Blood Required On, Total Pints */}
            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel>Blood Group:</FieldLabel>
                <Select
                  value={formData.bloodType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bloodType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Option" />
                  </SelectTrigger>
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
              </Field>

              <Field>
                <FieldLabel>Blood Required On:</FieldLabel>
                <DualDatePicker
                  value={formData.bloodRequiredOn}
                  onChange={(value) =>
                    setFormData({ ...formData, bloodRequiredOn: value })
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Total Number of Pints Required:</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={formData.totalPints}
                  onChange={(e) =>
                    setFormData({ ...formData, totalPints: e.target.value })
                  }
                  placeholder="Enter qty."
                  readOnly={formData.selectedComponents.length > 0}
                  className={cn(
                    formData.selectedComponents.length > 0 &&
                      'bg-muted/50 cursor-not-allowed'
                  )}
                />
                {formData.selectedComponents.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from blood components below
                  </p>
                )}
              </Field>
            </div>

            {/* Row 4: Status, Urgency, Transportation */}
            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel>Blood Request Status:</FieldLabel>
                <Select
                  value={formData.status}
                  onValueChange={(value: Request['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Urgency:</FieldLabel>
                <Select
                  value={formData.urgency}
                  onValueChange={(value: Request['urgency']) =>
                    setFormData({ ...formData, urgency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">Urgent</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Transportation Required:</FieldLabel>
                <Select
                  value={formData.transportationRequired}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      transportationRequired: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="maybe">If Needed</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Blood Components Section with Quantity */}
            <div className="space-y-3">
              <FieldLabel className="text-sm font-medium">
                Blood Components / Quantity:
              </FieldLabel>
              <div className="space-y-2">
                {bloodComponents.map((component) => {
                  const isChecked = formData.selectedComponents.includes(
                    component.id
                  );
                  return (
                    <div
                      key={component.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-md transition-colors',
                        isChecked
                          ? 'bg-emerald-50 border border-emerald-200'
                          : 'bg-muted/50 border border-transparent'
                      )}
                    >
                      <Checkbox
                        id={component.id}
                        checked={isChecked}
                        onCheckedChange={() =>
                          handleComponentToggle(component.id)
                        }
                      />
                      <label
                        htmlFor={component.id}
                        className="flex-1 text-sm font-medium leading-none cursor-pointer"
                      >
                        {component.label} ( {component.fullName} )
                      </label>
                      {isChecked && (
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`qty-${component.id}`}
                            className="text-xs text-muted-foreground"
                          >
                            Quantity (pints):
                          </label>
                          <Input
                            id={`qty-${component.id}`}
                            type="number"
                            min={1}
                            value={
                              formData.componentQuantities[component.id] || ''
                            }
                            onChange={(e) =>
                              handleComponentQuantityChange(
                                component.id,
                                e.target.value
                              )
                            }
                            className="w-24 h-8"
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {formData.selectedComponents.length > 0 && (
                <div className="flex items-center justify-end gap-2 px-3 text-sm">
                  <span className="text-muted-foreground">Total Pints:</span>
                  <span className="font-semibold text-emerald-600">
                    {formData.totalPints || '0'}
                  </span>
                </div>
              )}
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <FieldLabel className="text-sm font-medium">
                Upload Images (Optional):
              </FieldLabel>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />

                {formData.images.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-3">
                      {formData.images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={img.preview || '/placeholder.svg'}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {formData.images.length < 5 && (
                        <label
                          htmlFor="image-upload"
                          className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                        >
                          <Plus className="h-5 w-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Add
                          </span>
                        </label>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      {formData.images.length}/5 images uploaded
                    </p>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center py-6 cursor-pointer"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Click to upload images
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5 images (prescription, reports, etc.)
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Additional Details Collapsible */}
            <Collapsible
              open={additionalDetailsOpen}
              onOpenChange={setAdditionalDetailsOpen}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors">
                  <span className="font-medium">Additional Details</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      additionalDetailsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <Textarea
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalNotes: e.target.value,
                    })
                  }
                  placeholder="Enter any additional notes or special requirements..."
                  rows={4}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          <DialogFooter className="border-t pt-4 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isSubmitting ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>

        {/* Add Hospital Sub-dialog */}
        <Dialog open={addHospitalOpen} onOpenChange={setAddHospitalOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Add New Hospital</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Field>
                <FieldLabel>Hospital Name</FieldLabel>
                <Input
                  value={newHospitalName}
                  onChange={(e) => setNewHospitalName(e.target.value)}
                  placeholder="e.g., Bir Hospital"
                  autoFocus
                />
              </Field>
              <Field>
                <FieldLabel>Location</FieldLabel>
                <Input
                  value={newHospitalLocation}
                  onChange={(e) => setNewHospitalLocation(e.target.value)}
                  placeholder="e.g., Kaisermahal, Kathmandu"
                />
              </Field>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddHospitalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddHospital}
                disabled={!newHospitalName.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Add Hospital
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
