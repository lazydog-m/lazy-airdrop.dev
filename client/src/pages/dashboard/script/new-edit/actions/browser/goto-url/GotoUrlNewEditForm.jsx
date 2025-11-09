import FormProvider from "@/components/hook-form/FormProvider"
import RHFInput from "@/components/hook-form/RHFInput"
import { Col, Row } from "antd"
import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom"
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller, useWatch } from 'react-hook-form';
import Select from "@/components/Select";
import { ButtonPrimary } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import useMessage from "@/hooks/useMessage";
import { STEP_DEFAULT_TIMEOUT } from "@/enums/enum";
import { parseNumber, textTrim } from "@/utils/convertUtil";
import RHFTextarea from "@/components/hook-form/RHFTextarea";
import { Braces } from "lucide-react";

export default function GotoUrlNewEditForm({
  id,
  formData,
  action,
  buildCode = () => { },
  onUpdateLogic = () => { },
}) {

  const defaultValues = {
    description: formData?.description || '',
    delayTime: formData?.delayTime || '',
    url: formData?.url || '',
    timeout: formData?.timeout || '',
  };

  const methods = useForm({
    // resolver: yupResolver(GotuUrlSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    watch, getValues,
  } = methods;

  const onSubmit = (data) => {
    const { delayTime, url, description, timeout } = data;

    const parsedTimeout = parseNumber(delayTime);

    const updated = {
      id,
      code: buildCode({
        description: textTrim(description),
        delayTime: parsedTimeout,
        url: textTrim(url),
        // timeout
        action,
      }),
      formData: {
        description: textTrim(description),
        delayTime: parsedTimeout,
        url: textTrim(url),
        // timeout
      }
    }
    onUpdateLogic(updated)
  }

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Row gutter={[25, 20]} >

        <Col span={24}>
          <RHFTextarea
            label='Mô tả'
            name='description'
            placeholder='Nhập mô tả ...'
          />
        </Col>

        <Col span={24}>
          <RHFInput
            type='number'
            step={STEP_DEFAULT_TIMEOUT}
            min="0"
            // max="9999999999999999"
            label='Delay time (millisecond)'
            name='delayTime'
            placeholder='0'
          />
        </Col>

        <Col span={24}>
          <RHFInput
            label='Url'
            name='url'
            placeholder='Nhập url'
          />
        </Col>

        <Col span={24} className='d-flex justify-content-end mb-5'>
          <ButtonPrimary
            type='submit'
            title={'Lưu'}
            icon={<Braces />}
          />
        </Col>
      </Row>
    </FormProvider>
  )
}

