import {
	validEmpty,
	validCompanyName,
	validEmail,
	validName,
	validPassword,
	validPhone,
	validSize,
	validDate,
	validControlledRif,
	validControlledDocument,
	validNumber,
	validCardNumber,
	validDay,
	validMonth,
	validCVC,
} from "./generalValids";

export const isEmail = (email: string): string => {
	if (validEmpty(email)) return "Please enter an email";
	if (validEmail(email)) return "Please enter a valid email";
	return "";
};

export const isText = (text: string, name?: string): string => {
	if (validEmpty(text)) return `Please enter ${name}`;
	return "";
};

export const isCompanyName = (name: string): string => {
	if (validEmpty(name)) return "Please enter a name";
	if (validCompanyName(name)) return "Please enter a valid name";
	if (validSize(name.length))
		return "Please enter a name between 6 and 20 characters";
	return "";
};

export const isRif = (rif: string): string => {
	if (validEmpty(rif)) return "Please enter a RIF";
	if (validControlledRif(rif))
		return "The RIF must have 9 characters, the format is 12345678-9";
	return "";
};

export const isDocument = (document: string): string => {
	if (validEmpty(document)) return "Please enter a document number";
	if (validControlledDocument(document))
		return "Please enter a valid document, 7 or 8 characters";
	return "";
};

export const isPhone = (phone: string): string => {
	if (validEmpty(phone)) return "Please enter a phone number";
	if (validPhone(phone)) return "Please enter a valid phone number";
	return "";
};

export const isPassword = (password: string): string => {
	if (validEmpty(password)) return "Please enter a password";
	if (validPassword(password))
		return "The password must have at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character";
	return "";
};

const validRepeatPassword = (password: string, repeatPassword: string) =>
	password !== repeatPassword;

export const isRepeatPassword = (
	password: string,
	repeatPassword: string
): string => {
	if (validEmpty(repeatPassword)) return "Please confirm the password";
	if (validRepeatPassword(password, repeatPassword))
		return "Passwords do not match";
	return "";
};

export const isName = (name: string): string => {
	if (validEmpty(name)) return "Please enter a name";
	if (validName(name)) return "Please enter a valid name";
	return "";
};

export const isLastName = (lastName: string): string => {
	if (validEmpty(lastName)) return "Please enter a last name";
	if (validName(lastName)) return "Please enter a valid last name";
	return "";
};

export const isValidDateOfBirth = (value: string) => {
	if (validEmpty(value) || validDate(value)) return `Please enter a date`;
	return "";
};

export const isValidDate = (value: string) => {
	if (validEmpty(value)) return `Please enter a date`;
	if (validDate(value)) return `The date format should be dd/mm/yyyy`;
	return "";
};

export const isValidCharge = (value: string) => {
	if (validEmpty(value)) return `Please enter a position`;
	if (validName(value)) return `Please enter a valid position`;
	return "";
};

export const isValidDepartment = (value: string) => {
	if (validEmpty(value)) return "Please enter a department";
	if (validName(value)) return "Please enter a valid department";
	return "";
};

export const isReferenceNumber = (value: string) => {
	if (validEmpty(value)) return `Please enter a reference number`;
	if (!validNumber(value))
		return `Only numbers should be entered in the reference number`;
	return "";
};

export const isCardNumber = (value: string) => {
	if (validEmpty(value)) return `Please enter a card number`;
	if (validCardNumber(value))
		return `Please enter 15-19 numbers in the card number`;
	return "";
};

export const isSalary = (value: string): string => {
	if (value) {
		if (!validNumber(value))
			return `Only numbers should be entered for the salary`;
	}
	return "";
};

export const isMonth = (value: string): string => {
	if (validEmpty(value)) return `Please enter a month`;
	if (validMonth(value)) return `Please enter a valid month 01-12`;
	return "";
};

export const isDay = (value: string): string => {
	if (validEmpty(value)) return `Please enter a day`;
	if (validDay(value)) return `Please enter a valid day 01-31`;
	return "";
};

export const isCVC = (value: string): string => {
	if (validEmpty(value)) return `Please enter a CVC`;
	if (validCVC(value)) return `Please enter only 3 or 4 numbers in the CVC`;
	return "";
};

export const isNumber = (value: string, amount: number = 0): string => {
	if (validEmpty(value)) return `Please enter a number`;
	if (!validNumber(value, amount))
		return `Please enter ${amount ? amount : "only"} numbers`;
	return "";
};
