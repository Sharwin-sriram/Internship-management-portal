"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, X, CheckCircle, File as FileIcon, AlertCircle } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+33", label: "France (+33)" },
  { code: "+39", label: "Italy (+39)" },
  { code: "+86", label: "China (+86)" },
  { code: "+55", label: "Brazil (+55)" }
];

const STUDY_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgraduate",
  "Other"
];

const SKILL_SUGGESTIONS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "Java", "C++", "C#", "SQL", "MongoDB", "PostgreSQL", "Docker", "AWS",
  "Figma", "UI/UX Design", "Machine Learning", "Data Analysis", "Project Management"
];

export default function ApplyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Core fields requested by user
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [yearOfStudying, setYearOfStudying] = useState("");
  const [stream, setStream] = useState("");
  const [department, setDepartment] = useState("");
  
  // Skills and Files
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Skill auto-suggestions
  useEffect(() => {
    if (skillInput.trim().length > 0) {
      const filtered = SKILL_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [skillInput, skills]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
      setShowSuggestions(false);
      setErrors(prev => {
        const next = { ...prev };
        delete next.skills;
        return next;
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && skillInput === "" && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  // Drag and Drop validation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    if (validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setErrors(prev => {
        const next = { ...prev };
        delete next.file;
        return next;
      });
    } else {
      setErrors(prev => ({ ...prev, file: "Format must be PDF or DOCX." }));
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate form
  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!firstName.trim()) nextErrors.firstName = "First name is required";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required";
    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address";
    }
    
    if (!mobileNumber.trim()) {
      nextErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{7,15}$/.test(mobileNumber.replace(/[^0-9]/g, ""))) {
      nextErrors.mobileNumber = "Please enter a valid phone number";
    }

    if (!yearOfStudying) nextErrors.yearOfStudying = "Year of studying is required";
    if (!stream.trim()) nextErrors.stream = "Stream is required";
    if (!department.trim()) nextErrors.department = "Department is required";
    if (skills.length === 0) nextErrors.skills = "Please list at least one skill";
    if (!file) nextErrors.file = "Please upload your resume";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      document.querySelector(".error-marker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append("firstName", firstName.trim());
      body.append("lastName", lastName.trim());
      body.append("email", email.trim());
      body.append("phone", `${countryCode} ${mobileNumber.trim()}`);
      body.append("yearOfStudying", yearOfStudying);
      body.append("stream", stream.trim());
      body.append("department", department.trim());
      body.append("skills", JSON.stringify(skills));
      
      if (file) {
        body.append("resume", file);
      }

      const res = await fetch("http://localhost:9933/api/job-applications", {
        method: "POST",
        body
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Submission failed");
      }

      setShowToast(true);
      
      // Clear inputs
      setFirstName("");
      setLastName("");
      setEmail("");
      setMobileNumber("");
      setYearOfStudying("");
      setStream("");
      setDepartment("");
      setSkills([]);
      setFile(null);

      setTimeout(() => setShowToast(false), 5000);
    } catch (err: unknown) {
      alert(`Error submitting application: ${err instanceof Error ? err.message : "Internal Error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable styling tokens
  const labelClass = "block text-xs font-black text-slate-900 uppercase tracking-widest mb-2.5";
  const inputClass = "w-full px-4 py-4 rounded-none border border-gray-300 bg-white text-slate-950 placeholder-gray-400 outline-none transition-all duration-150 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black hover:border-gray-400";
  const errorInputClass = "!border-red-600 !ring-1 !ring-red-600 bg-red-50/20";
  const errorTextClass = "text-red-600 text-xs mt-2 flex items-center gap-1.5 error-marker font-bold tracking-wide uppercase";

  return (
    <div className="relative w-full">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-4 bg-white border border-black p-6 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-sm">
          <div className="w-10 h-10 rounded-none bg-slate-950 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-slate-950 font-black text-xs uppercase tracking-widest">SUBMITTED SUCCESSFULLY</p>
            <p className="text-gray-600 text-xs mt-1 font-semibold">Your career application has been received.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="ml-4 text-gray-400 hover:text-black transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Form Frame */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 p-8 md:p-14 rounded-none shadow-[8px_8px_0px_0px_rgba(243,244,246,1)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          
          {/* First Name */}
          <div>
            <label className={labelClass}>First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={e => {
                setFirstName(e.target.value);
                if (errors.firstName) setErrors(prev => { const n = { ...prev }; delete n.firstName; return n; });
              }}
              placeholder="e.g. Alexander"
              className={`${inputClass} ${errors.firstName ? errorInputClass : ""}`}
            />
            {errors.firstName && (
              <p className={errorTextClass}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className={labelClass}>Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={e => {
                setLastName(e.target.value);
                if (errors.lastName) setErrors(prev => { const n = { ...prev }; delete n.lastName; return n; });
              }}
              placeholder="e.g. Hamilton"
              className={`${inputClass} ${errors.lastName ? errorInputClass : ""}`}
            />
            {errors.lastName && (
              <p className={errorTextClass}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className={labelClass}>Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => { const n = { ...prev }; delete n.email; return n; });
              }}
              placeholder="e.g. alexander@company.com"
              className={`${inputClass} ${errors.email ? errorInputClass : ""}`}
            />
            {errors.email && (
              <p className={errorTextClass}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className={labelClass}>Mobile Number *</label>
            <div className="flex gap-0">
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                className="px-4 py-4 rounded-none border border-r-0 border-gray-300 bg-gray-50 text-slate-900 outline-none transition-all duration-150 text-sm font-bold tracking-wide focus:border-black focus:ring-1 focus:ring-black cursor-pointer"
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={mobileNumber}
                onChange={e => {
                  setMobileNumber(e.target.value);
                  if (errors.mobileNumber) setErrors(prev => { const n = { ...prev }; delete n.mobileNumber; return n; });
                }}
                placeholder="00000 00000"
                className={`${inputClass} ${errors.mobileNumber ? errorInputClass : ""}`}
              />
            </div>
            {errors.mobileNumber && (
              <p className={errorTextClass}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.mobileNumber}
              </p>
            )}
          </div>

          {/* Year of Studying */}
          <div>
            <label className={labelClass}>Year of Studying *</label>
            <select
              value={yearOfStudying}
              onChange={e => {
                setYearOfStudying(e.target.value);
                if (errors.yearOfStudying) setErrors(prev => { const n = { ...prev }; delete n.yearOfStudying; return n; });
              }}
              className={`${inputClass} ${errors.yearOfStudying ? errorInputClass : ""} text-slate-900 font-bold`}
            >
              <option value="" className="text-gray-400">Select current year</option>
              {STUDY_YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {errors.yearOfStudying && (
              <p className={errorTextClass}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.yearOfStudying}
              </p>
            )}
          </div>

          {/* Stream */}
          <div>
            <label className={labelClass}>Stream *</label>
            <input
              type="text"
              value={stream}
              onChange={e => {
                setStream(e.target.value);
                if (errors.stream) setErrors(prev => { const n = { ...prev }; delete n.stream; return n; });
              }}
              placeholder="e.g. Engineering, Applied Sciences"
              className={`${inputClass} ${errors.stream ? errorInputClass : ""}`}
            />
            {errors.stream && (
              <p className={errorTextClass}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.stream}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className={labelClass}>Department *</label>
            <input
              type="text"
              value={department}
              onChange={e => {
                setDepartment(e.target.value);
                if (errors.department) setErrors(prev => { const n = { ...prev }; delete n.department; return n; });
              }}
              placeholder="e.g. Computer Science, Information Technology"
              className={`${inputClass} ${errors.department ? errorInputClass : ""}`}
            />
            {errors.department && (
              <p className={errorTextClass}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.department}
              </p>
            )}
          </div>

          {/* Skill Sets */}
          <div>
            <label className={labelClass}>Skill Sets *</label>
            <div className={`relative rounded-none border bg-white p-3 min-h-[54px] flex flex-wrap items-center gap-2 transition-all duration-150 focus-within:border-black focus-within:ring-1 focus-within:ring-black ${errors.skills ? "!border-red-600 !ring-1 !ring-red-600 bg-red-50/20" : "border-gray-300 hover:border-gray-400"}`}>
              <div className="flex flex-wrap gap-2 w-full">
                {skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-900 text-white rounded-none text-xs font-bold uppercase tracking-wider">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  className="flex-1 min-w-[150px] bg-transparent outline-none text-slate-950 text-sm font-medium placeholder-gray-400 py-1 px-1"
                  placeholder={skills.length === 0 ? "Type skill & press Enter" : "Add more..."}
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-52 overflow-y-auto">
                  {suggestions.map(s => (
                    <li
                      key={s}
                      onClick={() => addSkill(s)}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-xs text-slate-900 font-bold uppercase tracking-wide transition-colors border-b border-gray-100 last:border-0"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.skills && (
              <p className={errorTextClass}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.skills}
              </p>
            )}
          </div>

          {/* Resume Upload - Spans both columns on desktop */}
          <div className="md:col-span-2 mt-4">
            <label className={labelClass}>Resume Upload *</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border border-dashed transition-all duration-150 rounded-none ${
                isDragging
                  ? "border-black bg-gray-50 scale-[1.005]"
                  : errors.file
                  ? "border-red-600 bg-red-50/10"
                  : "border-gray-300 hover:border-gray-400 bg-white"
              }`}
            >
              {!file ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-14 h-14 bg-gray-100 border border-gray-300 flex items-center justify-center mb-4 rounded-none">
                    <UploadCloud className="w-6 h-6 text-slate-900" />
                  </div>
                  <p className="text-slate-950 font-bold text-xs uppercase tracking-widest mb-1.5">DRAG & DROP RESUME</p>
                  <p className="text-gray-500 text-xs mb-6 font-semibold tracking-wide">PDF, DOC, or DOCX up to 5MB</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-slate-950 hover:bg-black text-white text-xs font-black uppercase tracking-widest transition-colors rounded-none"
                  >
                    Select File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-gray-50 border border-gray-300 flex items-center justify-center shrink-0 rounded-none">
                      <FileIcon className="w-5 h-5 text-slate-900" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-950 font-bold text-xs truncate uppercase tracking-wider">{file.name}</p>
                      <p className="text-gray-500 text-xs mt-1 font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-none transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {errors.file && (
              <p className={errorTextClass}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.file}
              </p>
            )}
          </div>

        </div>

        {/* Submit Section */}
        <div className="mt-12 flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full md:w-80 py-5 text-white font-black text-xs uppercase tracking-widest transition-all rounded-none border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
              ${isSubmitting
                ? "bg-gray-400 border-gray-400 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0"
                : "bg-slate-950 hover:bg-black"
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                PROCESSING...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                SUBMIT APPLICATION
              </span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
