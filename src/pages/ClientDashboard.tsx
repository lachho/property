
// We'll only include the parts that need fixing - the type conversions in ClientDashboard.tsx

// Function to handle form submission with proper type conversions
const handleFinancialUpdate = async (data: FormData) => {
  setIsSubmitting(true);
  try {
    // Convert string values to numbers
    const updatedData = {
      gross_income: Number(data.gross_income),
      partner_income: data.partner_income ? Number(data.partner_income) : null,
      dependants: Number(data.dependants),
      existing_loans: Number(data.existing_loans),
      marital_status: data.marital_status
    };

    await updateProfile(updatedData);
    
    toast({
      title: "Success",
      description: "Your financial information has been updated.",
    });
    
    setFinancialFormOpen(false);
  } catch (error) {
    console.error("Error updating financial info:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to update your financial information.",
    });
  } finally {
    setIsSubmitting(false);
  }
};

// Make sure form default values properly convert to number types
const form = useForm<FormData>({
  defaultValues: {
    gross_income: profile?.gross_income ? String(profile.gross_income) : "",
    marital_status: profile?.marital_status || "",
    partner_income: profile?.partner_income ? String(profile.partner_income) : "",
    dependants: profile?.dependants ? String(profile.dependants) : "0",
    existing_loans: profile?.existing_loans ? String(profile.existing_loans) : "0",
  },
});
