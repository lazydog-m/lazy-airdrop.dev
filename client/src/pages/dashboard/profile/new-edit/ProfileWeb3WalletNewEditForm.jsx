import FormProvider from "@/components/hook-form/FormProvider"
import RHFInput from "@/components/hook-form/RHFInput"
import { Col, Row } from "antd"
import { useState, useEffect } from 'react';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller, useWatch } from 'react-hook-form';
import Select from "@/components/Select";
import { ButtonOutline, ButtonPrimary } from "@/components/Button";
import { apiGet, apiPost, apiPut } from "@/utils/axios";
import useConfirm from "@/hooks/useConfirm";
import useSpinner from "@/hooks/useSpinner";
import useMessage from "@/hooks/useMessage";
import { ErrorMessage } from "@/components/ErrorMessage";
import Combobox from "@/components/Combobox";

export default function ProfileWeb3WalletNewEditForm({ isEdit, currentProfileWeb3Wallet, onUpdateData, onCloseModal, profileId }) {

  const [wallets, setWallets] = useState([]);

  const ProfileWalletSchema = Yup.object().shape({
    wallet_address: Yup.string()
      .trim().required('Địa chỉ ví không được để trống!'),
    secret_phrase: Yup.string()
      .trim().required('Secret phrase không được để trống!'),
    wallet_id: Yup.string()
      .trim().required('Chưa chọn ví Web3!'),
  });

  const defaultValues = {
    wallet_id: currentProfileWeb3Wallet?.wallet_id || '',
    wallet_address: currentProfileWeb3Wallet?.wallet_address || '',
    secret_phrase: currentProfileWeb3Wallet?.secret_phrase || '',
  };

  const methods = useForm({
    resolver: yupResolver(ProfileWalletSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    watch, getValues,
  } = methods;

  const { onSuccess, onError } = useMessage();
  const { showConfirm, onCloseLoader } = useConfirm();

  const onSubmit = async (data) => {
    if (isEdit) {
      const body = {
        ...data,
        id: currentProfileWeb3Wallet.id,
        profile_id: currentProfileWeb3Wallet.profile_id,
      }
      showConfirm("Xác nhận cập nhật ví Web3 của profile?", () => put(body));
    }
    else {
      const body = {
        ...data,
        profile_id: profileId,
      }
      console.log(body)
      showConfirm("Xác nhận thêm ví Web3 vào profile?", () => post(body));
    }
  }

  const triggerPost = () => {
    onCloseModal();
    onCloseLoader();
    onSuccess("Thêm mới thành công!");
  }

  const triggerPut = () => {
    onCloseModal();
    onCloseLoader();
    onSuccess("Cập nhật thành công!");
  }

  const post = async (body) => {
    try {
      const response = await apiPost("/profile-web3-wallets", body);
      onUpdateData(triggerPost)
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  const put = async (body) => {
    try {
      const response = await apiPut("/profile-web3-wallets", body);
      onUpdateData(triggerPut)
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await apiGet("/web3-wallets/active");
        setWallets(response.data.data || []);
        console.log(response.data.data)
      } catch (error) {
        console.error(error);
        onError(error.message)
        // setLoading(false);
      }
    }

    fetch();
  }, [])

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Row className='mt-5' gutter={[25, 20]} >

        <Col span={24}>
          <Controller
            name='wallet_id'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <label className='d-block font-inter fw-500 fs-14'>
                  Ví Web3
                  <span className={'required'}></span>
                </label>
                <Combobox
                  value={field.value}
                  placeholder='Chọn ví Web3'
                  placeholderSearch="ví Web3"
                  items={wallets.map((item) => item?.id)}
                  convertItem={(id) => wallets?.find(item => item?.id === id)?.name}
                  onChange={(value) => field.onChange(value)}
                />
                <ErrorMessage message={error?.message} />
              </>
            )}
          />
        </Col>

        <Col span={24}>
          <RHFInput
            label='Địa chỉ ví'
            name='wallet_address'
            placeholder='Nhập địa chỉ ví'
            required
          />
        </Col>

        <Col span={24}>
          <RHFInput
            label='Secret phrase'
            name='secret_phrase'
            placeholder='Nhập secret phrase'
            required
          />
        </Col>


        <Col span={24} className='d-flex justify-content-end mb-5 mt-5 gap-10'>
          <ButtonOutline type='button' title={'Hủy'} onClick={onCloseModal} />
          <ButtonPrimary type='submit' title={'Lưu thay đổi'} />
        </Col>
      </Row>
    </FormProvider>

  )
}

