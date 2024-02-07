'use client';

import ReactSelect, { ActionMeta, MultiValue } from 'react-select';
import makeAnimated from 'react-select/animated';

interface SelectProps {
  onChange: (
    newValue: MultiValue<unknown>,
    actionMeta: ActionMeta<unknown>
  ) => void | undefined;
  options?: Record<string, any>[];
  disabled?: boolean;
}

const animatedComponents = makeAnimated();

const Select: React.FC<SelectProps> = ({ onChange, options, disabled }) => {
  return (
    <ReactSelect
      isDisabled={disabled}
      isMulti
      onChange={onChange}
      options={options}
      components={animatedComponents}
      classNamePrefix="select"
      closeMenuOnSelect={false}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (provided, state) => ({
          ...provided,
          border: 'none',
          boxShadow: 'none',
          background: 'none'
        }),
        menuList: (base, _) => ({
          ...base,
          backgroundColor: 'none'
        }),
        option: (base, props) => ({
          ...base,
          backgroundColor: 'none'
        })
      }}
      classNames={{
        control: () => 'text-sm text-black',
        valueContainer: () => 'text-black',
        container: () => 'bg-transparent border rounded-md',
        menuList: () => 'bg-white dark:bg-zinc-950',
        option: () => 'hover:bg-zinc-300 dark:hover:bg-zinc-600 hover:cursor-pointer'
      }}
    />
  );
};

export default Select;
