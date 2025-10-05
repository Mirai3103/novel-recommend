import { z } from 'zod';

/**
 * Zod schemas for auth form validation
 */

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Tên đăng nhập không được để trống')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, 'Tên người dùng không được để trống')
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .max(50, 'Tên người dùng không được quá 50 ký tự')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Tên người dùng chỉ được chứa chữ cái, số, gạch dưới và gạch ngang'),
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được quá 100 ký tự'),
  confirmPassword: z
    .string()
    .min(1, 'Vui lòng xác nhận mật khẩu'),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, {
      message: 'Bạn phải đồng ý với điều khoản sử dụng',
    }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

