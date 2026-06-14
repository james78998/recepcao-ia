export function getStatusColor(status) {
  switch (status) {
    case "Novo lead":
      return "green";

    case "Demonstração":
      return "blue";

    case "Proposta":
      return "orange";

    case "Cliente":
      return "purple";

    default:
      return "gray";
  }
}