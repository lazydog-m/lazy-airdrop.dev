import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button, Group, Input, NumberField } from 'react-aria-components'
// antd
RHFInputNumber.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  textarea: PropTypes.bool,
};

export default function RHFInputNumber({ name, label, required, ...other }) {

  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          {label &&
            <label className='d-block font-inter fw-500 fs-14'>
              {label}
              <span className={required && 'required'}></span>
            </label>
          }
          <NumberField
            {...field}
            {...other}
            className='w-full space-y-2'
          >
            <Group
              className='
            mt-10 font-inter fs-14 color-white bdr
            relative inline-flex h-40 w-full custom-group
            items-center overflow-hidden 
            bg-color-light text-base whitespace-nowrap 
            shadow-xs border-1
            data-disabled:pointer-events-none 
            data-disabled:cursor-not-allowed 
            data-disabled:opacity-50 
            transition-all duration-200 ease-in-out
            focus-within:outline-none
            focus-within:ring-offset-1 focus-within:ring-offset-background
            focus-within:ring-[1px]
            focus-within:ring-offset-neutral-500
            focus-within:ring-[#d4d4d4]
            '>
              <Input className='
              w-full px-3 h-full outline-none
              ' />
              <Button
                slot='decrement'
                className='
               hover:!border-[#606060]
              !border-t-0
              !border-b-0
              !border-r-0
                border-1
              button-number pointer items-center
              flex aspect-square h-[inherit] 
              justify-center disabled:pointer-events-none
              disabled:cursor-not-allowed disabled:opacity-50
              transition-[color,box-shadow]
              '
              >
                <MinusIcon className='size-4' />
                <span className='sr-only'>Decrement</span>
              </Button>
              <Button
                slot='increment'
                className='
               hover:!border-[#606060]
              !border-t-0
              !border-b-0
              !border-r-0
                border-1
              button-number pointer items-center
              flex aspect-square h-[inherit]
              justify-center disabled:pointer-events-none
              disabled:cursor-not-allowed disabled:opacity-50
              transition-[color,box-shadow]
              '
              >
                <PlusIcon className='size-4' />
                <span className='sr-only'>Increment</span>
              </Button>
            </Group>
          </NumberField>
          {error && <span className={`font-inter color-red mt-3 d-block errorColor`}>{error?.message}</span>}
        </>
      )}

    />
  )

}
