import FormProvider from "@/components/hook-form/FormProvider"
import RHFInput from "@/components/hook-form/RHFInput"
import { Col, Row } from "antd"
import { useState, useEffect } from 'react';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { ButtonOutline, ButtonPrimary } from "@/components/Button";
import { apiGet, apiPost, apiPut } from "@/utils/axios";
import useConfirm from "@/hooks/useConfirm";
import { Checkbox } from "@/components/Checkbox";
import useSpinner from "@/hooks/useSpinner";
import useMessage from "@/hooks/useMessage";
import RHFTextarea from "@/components/hook-form/RHFTextarea";
import { ErrorMessage } from "@/components/ErrorMessage";
import Combobox from "@/components/Combobox";
import Autocomplete from "@/components/Autocomplete";
import { parseNumber } from "@/utils/convertUtil";
import { TaskType } from "@/enums/enum";

export default function ProjectTaskNewEditForm({
  onCloseModal,
  isEdit,
  currentTask,
  onUpdateData,
  projectId,
  selectedTaskTab,
}) {

  const TaskSchema = Yup.object().shape({
    name: Yup.string()
      .trim().required('Tên task không được để trống!'),
  });

  const defaultValues = {
    name: currentTask?.name || '',
    points: currentTask?.points || '', // null
    url: currentTask?.url || '',
    script_id: currentTask?.script_id || '',
    description: currentTask?.description || '',
    has_manual: isEdit ? currentTask.has_manual : false,
  };

  const methods = useForm({
    resolver: yupResolver(TaskSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    watch,
    getValues,
    formState: { isValid }
  } = methods;

  const { showConfirm, onCloseLoader } = useConfirm();
  const { onOpen, onClose } = useSpinner();
  const { onSuccess, onError } = useMessage();

  const onSubmit = async (data) => {
    console.log(data)
    const type = selectedTaskTab;
    const points = parseNumber(data?.points) || null;
    if (isEdit) {
      const body = {
        ...data,
        id: currentTask.id,
        project_id: projectId,
        points,
        type,
      }
      console.log(body)
      showConfirm("Xác nhận cập nhật task?", () => put(body));
    }
    else {
      const body = {
        ...data,
        project_id: projectId,
        points,
        type,
      }
      console.log(body)
      showConfirm("Xác nhận thêm mới task?", () => post(body));
    }
  }

  const triggerPost = () => {
    onCloseModal();
    onCloseLoader();
    onSuccess("Thêm mới thành công!")
  }

  const triggerPut = () => {
    onCloseModal();
    onCloseLoader();
    onSuccess("Cập nhật thành công!");
  }

  const post = async (body) => {
    try {
      const response = await apiPost("/tasks", body);
      onUpdateData(triggerPost);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  const put = async (body) => {
    try {
      const response = await apiPut("/tasks", body);
      onUpdateData(triggerPut);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  const [scripts, setScripts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await apiGet(`/scripts/project/${projectId}`);
        console.log(response.data.data)
        setScripts(response.data.data.data || []);
      } catch (error) {
        console.error(error);
        onError(error.message)
      }
    }

    fetch();
  }, [])

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Row className='mt-5' gutter={[25, 20]}>

        <Col span={(selectedTaskTab === TaskType.DAILY || selectedTaskTab === TaskType.POINTS) ? 16 : 24}>
          <Controller
            name='name'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <label className='d-block font-inter fw-500 fs-14'>
                  Tên task
                  <span className={'required'}></span>
                </label>
                <Autocomplete
                  value={field.value}
                  items={TASK_ARR}
                  onChange={(value) => field.onChange(value)}
                  placeholder='Nhập tên task'
                />
                <ErrorMessage
                  message={error?.message}
                />
              </>
            )}
          />
        </Col>

        {(selectedTaskTab === TaskType.DAILY || selectedTaskTab === TaskType.POINTS) &&
          <Col span={8}>
            <RHFInput
              label='Points bonus'
              name='points'
              placeholder='Nhập số points'
              type='number'
              min="1"
            // max="9999999999999999"
            />
          </Col>
        }

        <Col span={24}>
          <RHFInput
            label='Link'
            name='url'
            placeholder='https://www.lazy-airdrop.dev'
          />
        </Col>

        <Col span={24}>
          <Controller
            name='script_id'
            control={control}
            render={({ field }) => (
              <>
                <label className='d-block font-inter fw-500 fs-14'>
                  Script
                </label>
                <Combobox
                  value={field.value}
                  items={scripts?.map(item => item?.id) || []}
                  convertItem={(id) => scripts?.find(item => item?.id === id)?.name}
                  placeholder='Chọn script'
                  placeholderSearch="script"
                  onChange={(value) => field.onChange(value)}
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
            height="150px"
          />
        </Col>

        <Col span={24} className='d-flex gap-15 mt-6'>
          <Controller
            name='has_manual'
            control={control}
            render={({ field }) => (
              <>
                <Checkbox
                  {...field}
                  label='Manual'
                  checked={field.value}
                />
              </>
            )}
          />

        </Col>

        <Col span={24} className='d-flex justify-content-end mb-5 gap-10'>
          <ButtonOutline type='button' title={'Hủy'} onClick={onCloseModal} />
          <ButtonPrimary type='submit' title={'Lưu thay đổi'} />
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
