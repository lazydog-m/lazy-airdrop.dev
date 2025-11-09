import FormProvider from "@/components/hook-form/FormProvider"
import RHFInput from "@/components/hook-form/RHFInput"
import { Col, Row } from "antd"
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom"
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { ButtonPrimary } from "@/components/Button";
import { apiGet, apiPost, apiPut } from "@/utils/axios";
import useConfirm from "@/hooks/useConfirm";
import { PATH_DASHBOARD } from "@/routes/path";
import useMessage from "@/hooks/useMessage";
import RHFTextarea from "@/components/hook-form/RHFTextarea";
import { delayApi } from "@/utils/commonUtil";
import Combobox from "@/components/Combobox";
import { ErrorMessage } from "@/components/ErrorMessage";
import Autocomplete from "@/components/Autocomplete";

export default function ScriptNewEditForm({
  isEdit,
  onChangeScriptName,
  currentScript,
}) {

  const ScriptSchema = Yup.object().shape({
    name: Yup.string()
      .trim().required('Tên script không được để trống!'), // trim() an luon value
  });

  const defaultValues = {
    name: currentScript?.name || '',
    description: currentScript?.description || '',
    project_name: currentScript?.project_name || '',
  };

  const methods = useForm({
    resolver: yupResolver(ScriptSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    watch, getValues, setError, formState: { isValid, errors }
  } = methods;

  const { showConfirm, onCloseLoader } = useConfirm();
  const { onSuccess, onError } = useMessage();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (isEdit) {
      const body = {
        id: currentScript?.id,
        ...data,
        logicItems: currentScript?.logicItems?.map((item) => {
          return {
            type: item.type,
            id: item.id,
            formData: item.formData,
          }
        }),
      }
      console.log(body)
      showConfirm("Xác nhận cập nhật script?", () => put(body), '');
    }
    else {
      const body = {
        ...data,
        logicItems: currentScript?.logicItems?.map((item) => {
          return {
            type: item.type,
            id: item.id,
            formData: item.formData,
          }
        }),

      }
      console.log(body)
      showConfirm("Xác nhận tạo script?", () => post(body), '');
    }
  }

  const trigger = () => {
    navigate(PATH_DASHBOARD.script.list)
  }

  const post = async (body) => {
    try {
      const response = await apiPost("/scripts", body);

      delayApi(() => {
        onCloseLoader();
        onSuccess("Tạo mới thành công!");

        delayApi(() => {
          trigger();
        })
      })
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  const put = async (body) => {
    try {
      const response = await apiPut("/scripts", body);
      delayApi(() => {
        onCloseLoader();
        onSuccess("Tạo mới thành công!");

        delayApi(() => {
          trigger();
        })
      })
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }
  useEffect(() => {
    onChangeScriptName(`${watch('name')} ${watch('project_name') && `(${watch('project_name')})`}  `)
  }, [watch('name'), watch('project_name')]);

  useEffect(() => {
    if (isEdit) {
      reset(defaultValues)
    }
  }, [isEdit, currentScript?.id]);

  // useEffect(() => {
  //   if (Object.keys(errors).length > 0) {
  //     onOpenScript(true);
  //   }
  // }, [errors]);

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const params = {
        search,
      }

      try {
        const response = await apiGet("/projects/name/limit", params);
        console.log(response.data.data)
        setProjects(response.data.data.data || []);
      } catch (error) {
        console.error(error);
        onError(error.message)
      }
    }

    fetch();
  }, [search])

  return (
    <FormProvider id="scriptForm" methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Row gutter={[25, 20]} >

        <Col span={24}>
          <Controller
            name='name'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <label className='d-block font-inter fw-500 fs-14'>
                  Tên script
                  <span className={'required'}></span>
                </label>
                <Autocomplete
                  value={field.value}
                  items={TASK_ARR}
                  // onFocus={(e) => e.target.select()}
                  onChange={(value) => field.onChange(value)}
                  placeholder='Nhập tên script'
                />
                <ErrorMessage
                  message={error?.message}
                />
              </>
            )}
          />
        </Col>

        <Col span={24}>
          <Controller
            name='project_name'
            control={control}
            render={({ field }) => (
              <>
                <label className='d-block font-inter fw-500 fs-14'>
                  Dự án
                </label>
                <Combobox
                  value={field.value}
                  items={projects?.map(item => item?.name) || []}
                  placeholder='Chọn dự án'
                  placeholderSearch="dự án"
                  onChange={(value) => field.onChange(value)}
                  onChangeSearch={(value) => setSearch(value)}
                  searchApi={true}
                />
              </>
            )}
          />
        </Col>

        <Col span={24}>
          <RHFTextarea
            label='Mô tả'
            name='description'
            placeholder='Nhập mô tả ...'
            height="200px"
          />
        </Col>

        <Col span={24} className='d-flex justify-content-end mb-5 mt-5'>
          <ButtonPrimary
            type={'submit'}
            title={'Lưu thay đổi'}
          />
        </Col>
      </Row>
    </FormProvider>

  )
}

const TASK_ARR = [
  'Check-In',
  'Faucet',
  'Bridge',
  'Swap',
  'Stake',
  'Chatbot',
  'Quiz',
  'Reg',
  'Login',
];
