const FormateNumber = ({ number }) => {
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(number);
};
export default FormateNumber;
