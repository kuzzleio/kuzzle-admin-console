import { cva, type VariantProps } from 'class-variance-authority';

export { default as Spinner } from './Spinner.vue';

export const spinnerVariants = cva(
  [
    'inline-block shrink-0 align-middle',
    'rounded-full border-current border-r-transparent',
    'animate-spin motion-reduce:animate-none',
  ].join(' '),
  {
    defaultVariants: {
      size: 'default',
    },
    variants: {
      size: {
        default: 'size-6 border-2',
        lg: 'size-10 border-4',
        sm: 'size-4 border-2',
      },
    },
  },
);

export type SpinnerVariants = VariantProps<typeof spinnerVariants>;
