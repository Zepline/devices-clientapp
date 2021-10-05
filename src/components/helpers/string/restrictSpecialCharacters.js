export default function restrictSpecialCharacters(event) {

    // eslint-disable-next-line
    const specialCharacters = new RegExp("^[a-zA-Z\-0-9 ]+$");
    const key = String.fromCharCode(!event.charCode ? event.which : event.charCode);

    if (!specialCharacters.test(key)) {

        event.preventDefault();
        return false;
    }
}