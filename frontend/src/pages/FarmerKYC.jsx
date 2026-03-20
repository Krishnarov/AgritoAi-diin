import { useState, useEffect, useRef } from "react";
import { ShieldCheck, CheckCircle, Loader2, Upload, X, FileText, Camera } from "lucide-react";
import api from "../utils/api.js";
import toast from "react-hot-toast";

const inputCls = "w-full bg-green-950/20 border border-green-900/10 rounded-2xl px-6 py-4 text-green-100 text-sm outline-none focus:border-green-500 transition-all font-bold placeholder:text-green-900 shadow-inner";

function FileUploadBox({ label, fieldName, file, onChange, required }) {
  const ref = useRef();
  return (
    <div>
      <label className="text-green-900 text-[10px] uppercase font-black tracking-[0.2em] mb-3 block ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => ref.current.click()}
        className="w-full bg-green-950/20 border-2 border-dashed border-green-900/20 hover:border-green-500/40 rounded-2xl px-6 py-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
      >
        {file ? (
          <div className="flex items-center gap-3 w-full">
            <FileText size={20} className="text-green-400 shrink-0" />
            <span className="text-green-300 text-xs font-bold truncate flex-1">{file.name}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null); }}
              className="text-red-400 hover:text-red-300"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={22} className="text-green-800 group-hover:text-green-500 transition-colors" />
            <span className="text-green-900 text-[10px] font-black uppercase tracking-widest group-hover:text-green-600 transition-colors">
              Click to upload
            </span>
            <span className="text-green-950 text-[9px]">PDF, JPG, PNG • Max 5MB</span>
          </>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={e => onChange(e.target.files[0] || null)}
      />
    </div>
  );
}

export default function FarmerKYC() {
  const [kycStatus, setKycStatus] = useState(null);
  const [kycVerified, setKycVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    dob: "",
    doc_type: "aadhaar",
    aadhaar_number: "",
    pan_number: "",
    address: "",
  });

  const [files, setFiles] = useState({
    aadhaar_doc: null,
    pan_doc: null,
    selfie: null,
  });

  useEffect(() => {
    api.get("/farmer/kyc/status")
      .then(({ data }) => {
        setKycStatus(data.kyc);
        setKycVerified(data.kyc_verified);
        if (data.kyc) {
          setForm(prev => ({
            ...prev,
            full_name: data.kyc.full_name || "",
            dob: data.kyc.dob || "",
            doc_type: data.kyc.doc_type || "aadhaar",
            aadhaar_number: data.kyc.aadhaar_number || "",
            pan_number: data.kyc.pan_number || "",
            address: data.kyc.address || "",
          }));
        }
      })
      .catch(() => toast.error("Failed to load KYC status"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.aadhaar_doc) return toast.error("Aadhaar document is required");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("aadhaar_doc", files.aadhaar_doc);
    if (files.pan_doc) fd.append("pan_doc", files.pan_doc);
    if (files.selfie) fd.append("selfie", files.selfie);

    setSubmitting(true);
    try {
      await api.post("/farmer/kyc/submit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("KYC request submitted! Admin will review shortly.");
      setKycStatus({ status: "pending" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = {
    pending: <div className="flex items-center gap-3 bg-yellow-500/10 px-5 py-3 rounded-2xl border border-yellow-500/20"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" /><span className="text-yellow-500 text-xs font-black uppercase tracking-widest">Under Review</span></div>,
    approved: <div className="flex items-center gap-3 bg-green-500/10 px-5 py-3 rounded-2xl border border-green-500/20"><CheckCircle size={18} className="text-green-400" /><span className="text-green-400 text-xs font-black uppercase tracking-widest">Verified</span></div>,
    rejected: <div className="flex items-center gap-3 bg-red-500/10 px-5 py-3 rounded-2xl border border-red-500/20"><X size={18} className="text-red-400" /><span className="text-red-400 text-xs font-black uppercase tracking-widest">Rejected</span></div>,
    resubmit_requested: <div className="flex items-center gap-3 bg-orange-500/10 px-5 py-3 rounded-2xl border border-orange-500/20"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" /><span className="text-orange-400 text-xs font-black uppercase tracking-widest">Resubmit Required</span></div>,
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <header className="flex flex-col gap-2 border-b border-green-950 pb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
          <ShieldCheck size={40} className="text-green-500" />
          KYC Verification
        </h1>
        <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em] mt-2">
          Identity Verification • Document Upload • Account Activation
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-green-800 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Status Panel */}
          <div className="space-y-6">
            <div className="bg-green-950/20 border border-green-900/10 rounded-[2rem] p-8 shadow-2xl backdrop-blur-sm">
              <p className="text-green-800 text-[9px] font-black uppercase tracking-widest mb-4">KYC Status</p>
              {kycVerified
                ? statusBadge["approved"]
                : kycStatus?.status
                ? statusBadge[kycStatus.status]
                : <div className="flex items-center gap-3 bg-green-950/30 px-5 py-3 rounded-2xl border border-green-900/20"><div className="w-2.5 h-2.5 rounded-full bg-green-900" /><span className="text-green-900 text-xs font-black uppercase tracking-widest">Not Submitted</span></div>
              }
            </div>

            {kycStatus?.status === "rejected" && kycStatus?.reject_reason && (
              <div className="bg-red-950/20 border border-red-900/20 rounded-[2rem] p-8">
                <p className="text-red-800 text-[9px] font-black uppercase tracking-widest mb-2">Rejection Reason</p>
                <p className="text-red-400 text-sm">{kycStatus.reject_reason}</p>
              </div>
            )}

            <div className="bg-green-950/10 border border-green-900/10 rounded-[2rem] p-8 space-y-3">
              <p className="text-green-800 text-[9px] font-black uppercase tracking-widest mb-2">Required Documents</p>
              {[
                { icon: FileText, label: "Aadhaar Card", req: true },
                { icon: FileText, label: "PAN Card", req: false },
                { icon: Camera, label: "Live Selfie", req: false },
              ].map(({ icon: Icon, label, req }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={14} className="text-green-700" />
                  <span className="text-green-700 text-xs font-bold">{label}</span>
                  {req && <span className="text-red-500 text-[9px] font-black">REQUIRED</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-green-950/20 border border-green-900/10 rounded-[3.5rem] p-12 shadow-2xl backdrop-blur-md space-y-8">

              {/* Personal Info */}
              <div>
                <h3 className="text-white font-black text-lg mb-6 uppercase tracking-tight italic">Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-green-900 text-[10px] uppercase font-black tracking-[0.2em] mb-3 block ml-1">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="As per Aadhaar" value={form.full_name}
                      onChange={e => setForm({ ...form, full_name: e.target.value })}
                      className={inputCls} required />
                  </div>
                  <div>
                    <label className="text-green-900 text-[10px] uppercase font-black tracking-[0.2em] mb-3 block ml-1">Date of Birth <span className="text-red-500">*</span></label>
                    <input type="date" value={form.dob}
                      onChange={e => setForm({ ...form, dob: e.target.value })}
                      className={inputCls} required />
                  </div>
                </div>
              </div>

              {/* Document Info */}
              <div>
                <h3 className="text-white font-black text-lg mb-6 uppercase tracking-tight italic">Document Details</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-green-900 text-[10px] uppercase font-black tracking-[0.2em] mb-3 block ml-1">Document Type <span className="text-red-500">*</span></label>
                    <select value={form.doc_type} onChange={e => setForm({ ...form, doc_type: e.target.value })}
                      className={inputCls}>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="voter_id">Voter ID</option>
                      <option value="driving_license">Driving License</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-green-900 text-[10px] uppercase font-black tracking-[0.2em] mb-3 block ml-1">Aadhaar Number <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="XXXX XXXX XXXX" value={form.aadhaar_number}
                        onChange={e => setForm({ ...form, aadhaar_number: e.target.value })}
                        className={inputCls} maxLength={14} required />
                    </div>
                    <div>
                      <label className="text-green-900 text-[10px] uppercase font-black tracking-[0.2em] mb-3 block ml-1">PAN Number (Optional)</label>
                      <input type="text" placeholder="ABCDE1234F" value={form.pan_number}
                        onChange={e => setForm({ ...form, pan_number: e.target.value.toUpperCase() })}
                        className={inputCls} maxLength={10} />
                    </div>
                  </div>
                  <div>
                    <label className="text-green-900 text-[10px] uppercase font-black tracking-[0.2em] mb-3 block ml-1">Residential Address <span className="text-red-500">*</span></label>
                    <textarea placeholder="Full address as per document..." rows={3} value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                      className={`${inputCls} resize-none leading-relaxed font-medium`} required />
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div>
                <h3 className="text-white font-black text-lg mb-6 uppercase tracking-tight italic">Upload Documents</h3>
                <div className="space-y-6">
                  <FileUploadBox label="Aadhaar Card Document" fieldName="aadhaar_doc"
                    file={files.aadhaar_doc} onChange={f => setFiles({ ...files, aadhaar_doc: f })} required />
                  <FileUploadBox label="PAN Card Document" fieldName="pan_doc"
                    file={files.pan_doc} onChange={f => setFiles({ ...files, pan_doc: f })} />
                  <FileUploadBox label="Live Selfie / Photo" fieldName="selfie"
                    file={files.selfie} onChange={f => setFiles({ ...files, selfie: f })} />
                </div>
              </div>

              <button type="submit" disabled={submitting || kycStatus?.status === "pending"}
                className="w-full bg-green-600 hover:bg-green-500 text-black font-black text-[10px] uppercase tracking-widest h-20 rounded-[2rem] transition-all shadow-2xl shadow-green-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                {submitting
                  ? <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                  : kycStatus?.status === "pending"
                  ? "Request Under Review"
                  : "Submit KYC Request"
                }
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
