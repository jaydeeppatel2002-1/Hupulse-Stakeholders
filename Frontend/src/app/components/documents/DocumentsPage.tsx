import React from "react";

export function DocumentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 py-6 rounded-3xl" style={{ background: "#0B0B1D", border: "1px solid #1C1C33" }}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Documents</h1>
            <p className="text-sm text-slate-400">Central hub for project files, templates, and stakeholder documentation.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-[#1A1A38] p-5" style={{ background: "#090918" }}>
            <div className="text-sm font-medium text-slate-300">Project Guidelines</div>
            <p className="mt-2 text-xs text-slate-500">Store and access the core stakeholder engagement standards and documentation templates.</p>
          </div>
          <div className="rounded-3xl border border-[#1A1A38] p-5" style={{ background: "#090918" }}>
            <div className="text-sm font-medium text-slate-300">Meeting Notes</div>
            <p className="mt-2 text-xs text-slate-500">Capture important discussion records and follow-up actions tied to stakeholders.</p>
          </div>
          <div className="rounded-3xl border border-[#1A1A38] p-5" style={{ background: "#090918" }}>
            <div className="text-sm font-medium text-slate-300">Templates & Policies</div>
            <p className="mt-2 text-xs text-slate-500">Keep stakeholder templates, playbooks, and compliance references available.</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 rounded-3xl border border-[#1A1A38]" style={{ background: "#090918" }}>
        <h2 className="text-lg font-semibold text-white">Overview</h2>
        <p className="mt-3 text-sm text-slate-400">This page is the home for stakeholder documentation and knowledge artifacts. In the final product, it can be extended to show document collections, quick links, and collaborative notes.</p>
      </div>
    </div>
  );
}
