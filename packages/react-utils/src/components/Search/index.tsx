import { debounce } from 'lodash';
import React, { ChangeEvent } from 'react';
import { Input } from 'antd';
import { OnChangeType, DEBOUNCE_HANDLER_MS } from './utils';
import { SearchOutlined } from '@ant-design/icons';
import { InputProps } from 'antd/lib/input/';
import { useTranslation } from '../../mls';

/**
 * Interface for SearchForm props
 */
export interface SearchFormProps extends InputProps {
  onChangeHandler: OnChangeType;
}

const defaultPrefix = <SearchOutlined style={{ fontSize: '16px', fontWeight: 'bold' }} />;
/**
 * default props for SearchForm component
 */
export const defaultSearchProps: SearchFormProps = {
  onChangeHandler: () => {
    return;
  },
  size: 'large',
  addonBefore: defaultPrefix,
  allowClear: true,
};

/**
 * Base SearchForm component
 *
 * @param props - the component's props
 */
const SearchForm = (props: SearchFormProps) => {
  const { onChangeHandler, ...passedOnProps } = props;
  // HACK to preserve defaultProps back compatibility
  const { t } = useTranslation();
  passedOnProps['placeholder'] = props.placeholder ?? t('Search');

  /**
   * inbuilt default onChangeHandler that debounces the passed changeHandler
   *
   * @param {ChangeEvent<HTMLInputElement>} event - the input event
   */
  const debouncedOnChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    event.persist();
    const debouncedFn = debounce(
      (ev: ChangeEvent<HTMLInputElement>) => onChangeHandler(ev),
      DEBOUNCE_HANDLER_MS
    );
    debouncedFn(event);
  };

  return (
    <div className="search-input-wrapper">
      <Input onChange={debouncedOnChangeHandler} {...passedOnProps}></Input>
    </div>
  );
};

SearchForm.defaultProps = defaultSearchProps;

export { SearchForm };
