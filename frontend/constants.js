const CHECKOUT_SECTIONS = [
  {selector: "yourInformation", label: "Your Information"}, 
  {selector: "shippingInformation", label: "Shipping Information"}, 
  {selector: "shippingMethod", label: "Shipping Method"}, 
  {selector: "paymentInformation", label: "Payment Information"}, 
  {selector: "reviewOrder", label: "Review Order"},
  {selector: "checkout", label: "Checkout"},
  {selector: "confirmation", label: "Purchase Complete!", hide: true},
];

const ACCOUNT_SECTIONS = [
  {selector: "information", label: "Your Account Information"},
  {selector: "orderHistory", label: "Order History"},
  {selector: "addressBook", label: "Address Book"},
];

const CREDIT_CARD_TYPES = [
  {value: "visa", text: "Visa"},
  {value: "mastercard", text: "Mastercard"},
  {value: "american-express", text: "American Express"},
  {value: "discover", text: "Discover"},
];

const ORDER_STATUSES = [
  {value: "pending", isSuccessful: true},
  {value: "success", isSuccessful: true},
  {value: "processing", isSuccessful: true},
  {value: "failed", isSuccessful: false},
  {value: "cancelled", isSuccessful: false},
];

const ERROR_MESSAGES = {
  formIncomplete: "The form is incomplete. Please check your input and try again!",
  emailInvalid: "Please check the format of your email address.",
  passwordMismatch: "Your passwords do not match. Please check and try again!",
  passwordInvalid: "Please check your password for the follow:\nMinimum 8 characters\n1 uppercase letter\n1 lowercase letter\n1 digit\n1 symbol\nNo spaces",
  emailNotRegistered: "This email is not registered to an Indie Lee account.",
  default: "Something went wrong. Please contact us at customerservice@indielee.com for further assistance.",
};

module.exports = {
  CHECKOUT_SECTIONS,
  ACCOUNT_SECTIONS,
  CREDIT_CARD_TYPES,
  ORDER_STATUSES,
  ERROR_MESSAGES,
};