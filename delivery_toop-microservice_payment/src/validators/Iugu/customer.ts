/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/class-name-casing */

const validatePost = (post: iPayloadStore): string | boolean => {
  if (!post.email) {
    return 'Enter the email';
  }

  if (!post.name) {
    return 'Enter the name';
  }

  if (!post.cpf_cnpj) {
    return 'Enter the cpf_cnpj';
  }

  if (!post.zip_code) {
    return 'Enter the zip_code';
  }

  return true;
};

export default validatePost;

interface iPayloadStore {
  cpf_cnpj: string;
  name: string;
  email?: string;
  phone_prefix?: string;
  phone?: string;
  zip_code: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  country: string;
  complement?: string;
}
