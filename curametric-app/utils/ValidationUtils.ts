export const isNumeric = (value: string) => /^\d+(\.\d+)?$/.test(value);

export const validateField = (value: string, fieldName: string, numeric = false, setErrors: any) => {
  if (numeric && !isNumeric(value)) {
    setErrors((prev: any) => ({ ...prev, [fieldName]: "Debe ser numérico." }));
    return false;
  } else if (!value) {
    setErrors((prev: any) => ({ ...prev, [fieldName]: "Campo obligatorio." }));
    return false;
  }
  setErrors((prev: any) => ({ ...prev, [fieldName]: null }));
  return true;
};

export const validateCurrentSection = (currentSection: number, states: any, setErrors: any) => {
  let valid = true;
  switch (currentSection) {
    case 0:
      if (!validateField(states.width, "width", true, setErrors)) valid = false;
      if (!validateField(states.height, "height", true, setErrors)) valid = false;
      if (!validateField(states.depth, "depth", true, setErrors)) valid = false;
      break;
    case 1:
      if (!validateField(states.granulationTissue, "granulationTissue", true, setErrors)) valid = false;
      if (!validateField(states.slough, "slough", true, setErrors)) valid = false;
      if (!validateField(states.necroticTissue, "necroticTissue", true, setErrors)) valid = false;
      const totalTissue =
        parseFloat(states.granulationTissue || "0") +
        parseFloat(states.slough || "0") +
        parseFloat(states.necroticTissue || "0");
      if (totalTissue > 100) {
        alert("La suma de tejidos no puede exceder 100%.");
        valid = false;
      }
      break;
    case 2:
      if (!validateField(states.borders, "borders", false, setErrors)) valid = false;
      if (!validateField(states.surroundingSkin, "surroundingSkin", false, setErrors)) valid = false;
      if (!validateField(states.edema, "edema", false, setErrors)) valid = false;
      if (!validateField(states.exudateAmount, "exudateAmount", false, setErrors)) valid = false;
      if (!validateField(states.exudateType, "exudateType", false, setErrors)) valid = false;
      break;
    case 3:
      // Validaciones específicas para la última sección si es necesario
      break;
    default:
      break;
  }
  return valid;
};