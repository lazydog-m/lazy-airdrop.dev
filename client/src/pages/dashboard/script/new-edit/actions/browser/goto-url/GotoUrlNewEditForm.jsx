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
import { Color, STEP_DEFAULT_TIMEOUT } from "@/enums/enum";
import { parseNumber, textTrim } from "@/utils/convertUtil";
import RHFTextarea from "@/components/hook-form/RHFTextarea";
import { Braces, CheckCheck, Loader, LoaderCircle } from "lucide-react";
import RHFInputNumber from "@/components/hook-form/RHFInputNumber";
import { delayApi, delay } from "@/utils/commonUtil";
import useSpinner from "@/hooks/useSpinner";
import { Spinner } from "@/components/ui/spinner";

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

  const [isLoading, setIsLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    watch, getValues, formState: { isSubmitSuccessful, isDirty }
  } = methods;

  const onSubmit = (data) => {
    setIsLoading(true);
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

    delayApi(() => {
      onUpdateLogic(updated)
      setIsLoading(false);
      setUpdated(true);
    })
  }

  useEffect(() => {
    const sub = watch(() => setUpdated(false));
    return () => sub.unsubscribe();
  }, []);

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
          <RHFInputNumber
            step={STEP_DEFAULT_TIMEOUT}
            minValue={0}
            // maxValue="9999999999999999"
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

        <Col span={24} className='d-flex justify-content-end'>
          <ButtonPrimary
            type='submit'
            title={'Update properties'}
            style={{
              opacity: isLoading ? '0.5' : '1',
              pointerEvents: isLoading ? 'none' : '',
            }}
            icon={
              isLoading ? <Spinner className="" /> : <Braces />
            }
          />
        </Col>
        <Col span={24} className='d-flex justify-content-end'>
          {updated &&
            <span className="fs-14 flex items-center gap-6 font-inter" style={{ color: Color.SUCCESS }}>
              <CheckCheck size={16} />
              {MESSAGE_UPDATED}
            </span>
          }
        </Col>
      </Row>
    </FormProvider>
  )
}

const MESSAGE_UPDATED = 'Updated properties!';

