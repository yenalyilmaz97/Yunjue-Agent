import { type InputHTMLAttributes, ReactNode } from 'react'
import { FormGroup, FormLabel, FormSelect, type FormControlProps } from 'react-bootstrap'
import Feedback from 'react-bootstrap/esm/Feedback'
import { Controller, type FieldPath, type FieldValues } from 'react-hook-form'

import type { FormInputProps } from '@/types/component-props'

type SelectOption = {
    value: string | number
    label: string
}

type SelectFormInputProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = FormInputProps<TFieldValues, TName> &
    FormControlProps &
    InputHTMLAttributes<HTMLSelectElement> & {
        options?: SelectOption[]
        children?: ReactNode
    }

const SelectFormInput = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
    name,
    containerClassName: containerClass,
    control,
    id,
    label,
    noValidate,
    labelClassName: labelClass,
    options,
    children,
    ...other
}: SelectFormInputProps<TFieldValues>) => {
    return (
        <Controller<TFieldValues, TName>
            name={name as TName}
            control={control}
            render={({ field, fieldState }) => (
                <FormGroup className={containerClass}>
                    {label &&
                        (typeof label === 'string' ? (
                            <FormLabel htmlFor={id ?? name} className={labelClass}>
                                {label}
                            </FormLabel>
                        ) : (
                            <>{label}</>
                        ))}
                    <FormSelect
                        id={id ?? name}
                        {...other}
                        {...field}
                        isInvalid={Boolean(fieldState.error?.message)}
                        value={field.value?.toString() ?? ''}
                    >
                        {children}
                        {options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FormSelect>
                    {!noValidate && fieldState.error?.message && <Feedback type="invalid">{fieldState.error?.message}</Feedback>}
                </FormGroup>
            )}
        />
    )
}

export default SelectFormInput
