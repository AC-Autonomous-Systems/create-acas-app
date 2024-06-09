export function generateRandomString(length: number): string {
  let lettersAndDigits =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let resultStr = '';
  for (let i = 0; i < length; i++) {
    resultStr += lettersAndDigits.charAt(
      Math.floor(Math.random() * lettersAndDigits.length)
    );
  }
  return resultStr;
}
