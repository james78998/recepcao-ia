import { useState } from "react";
import { leads as mockLeads } from "../data/leads";

export function useLeads() {
  const [leads, setLeads] = useState(mockLeads);

  function addLead(lead) {
    setLeads([...leads, lead]);
  }

  function removeLead(id) {
    setLeads(leads.filter((lead) => lead.id !== id));
  }

  function updateLead(id, newData) {
    setLeads(
      leads.map((lead) =>
        lead.id === id
          ? { ...lead, ...newData }
          : lead
      )
    );
  }

  return {
    leads,
    addLead,
    removeLead,
    updateLead,
  };
}