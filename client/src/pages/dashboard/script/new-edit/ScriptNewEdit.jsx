import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from "react-router-dom"
// form
import { apiGet } from "@/utils/axios";
import useSpinner from "@/hooks/useSpinner";
import Page from "@/components/Page";
import Container from "@/components/Container";
import { HeaderBack } from "@/components/HeaderSection";
import { PATH_DASHBOARD } from "@/routes/path";
import ScriptNewEditDetails from './ScriptNewEditDetails';
import { delayApi } from '@/utils/commonUtil';
import { ButtonInfo, ButtonOutline, ButtonOutlineInfo, ButtonPrimary, ButtonOrange, ButtonOutlineOrange } from '@/components/Button';
import { Chrome, CirclePlay, Code, Loader, Logs, Save } from 'lucide-react';
import Modal from '@/components/Modal';
import ScriptNewEditForm from './ScriptNewEditForm';
import useMessage from '@/hooks/useMessage';
import { Drawer } from 'antd';
import { Badge } from '@/components/ui/badge';
import ScriptPreviewCode from './ScriptPreviewCode';
import ScriptLogs from './ScriptLogs';
import { BROWSER } from './actions/browser/Browser';
import { WEB_INTERACTION } from './actions/web-interaction/WebInteraction';
import useSocket from '@/hooks/useSocket';
import { BadgePrimaryOutline } from '@/components/Badge';

const ScriptNewEditDetailsMemo = React.memo(ScriptNewEditDetails);

const ACTIONS_DATA = [
  ...BROWSER,
  ...WEB_INTERACTION,
]

export default function ScriptNewEdit() {

  const { id } = useParams();
  const location = useLocation();
  const isEdit = location.pathname.includes('edit');
  const [data, setData] = useState({
    logicItems: [],
  });
  const [logs, setLogs] = useState([]);
  const { onOpen, onClose } = useSpinner();
  const { onError } = useMessage();
  const socket = useSocket();

  // drawer
  const [openScript, setOpenScript] = useState(false);
  const [openLogs, setOpenLogs] = useState(false);

  // openning, runnning, loading
  const [openningProfile, setOpenningProfile] = useState(false);
  const [runnningScript, setRunningScript] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingScript, setLoadingScript] = useState(false);

  // code, name
  const [openPreviewCode, setOpenPreviewCode] = useState(false);
  const [scriptName, setScriptName] = useState('');

  const handleUpdateLogicItemsFromRes = (logicItems = []) => {
    const ACTIONS_DATA_FLAT = ACTIONS_DATA.flatMap(group => group.children);

    const mergedLogicItems = logicItems.map(item => {
      const actionItem = ACTIONS_DATA_FLAT.find(action => action.type === item.type);

      if (!actionItem) return item;

      return {
        ...actionItem,
        id: item.id,
        formData: item.formData,
        code: actionItem.buildCode({
          ...item.formData,
          action: actionItem.name,
        }),
      };
    });

    return mergedLogicItems;
  }

  useEffect(() => {
    const fetch = async () => {
      onOpen();
      try {
        const response = await apiGet(`/scripts/${id}`);
        delayApi(() => {
          const res = response.data.data;
          const logicItems = res?.data?.logicItems;
          const updatedLogicItems = handleUpdateLogicItemsFromRes(logicItems);
          const data = {
            ...res?.data,
            logicItems: updatedLogicItems,
            code: getAllCode(updatedLogicItems),
          }

          setData(data || {});
          setOpenningProfile(res?.profileTestOpenning)
          console.log(res);
          onClose();
        })
      } catch (error) {
        console.error(error);
        onError(error.message)
        onClose();
      }
    }

    const fetchCurrentProfileTest = async () => {
      onOpen();
      try {
        const response = await apiGet(`/scripts/profile-test/current`);
        delayApi(() => {
          const res = response.data.data;

          setOpenningProfile(res)
          console.log(res);
          onClose();
        })
      } catch (error) {
        console.error(error);
        onError(error.message)
        onClose();
      }
    }

    if (isEdit) {
      fetch();
    }
    else {
      fetchCurrentProfileTest();
    }
  }, [id]) // nagivate

  const getAllCode = (logicItems) => logicItems
    ?.map(item => item.code)
    ?.join('\n\n');

  const handleUpdateLogicItems = useCallback((updater) => {
    setData(prev => {
      const newLogicItems =
        typeof updater === "function" ? updater(prev.logicItems) : updater;

      return {
        ...prev,
        logicItems: newLogicItems,
        code: getAllCode(newLogicItems),
        // them final duration
      };
    });
  }, []);

  const runScript = async () => {
    const params = {
      codes: data?.logicItems?.map(item => item?.code),
    }

    try {
      setLoadingScript(true);
      setLogs([]);
      const response = await apiGet(`/scripts/run-script/test`, params);
      setOpenLogs(true);
      setLoadingScript(false);
      setRunningScript(true);
      setOpenningProfile(true);
    } catch (error) {
      console.error(error);
      onError(error.message);
      setLoadingScript(false);
    }
  }

  const stopScript = async () => {
    try {
      setLoadingScript(true);
      const response = await apiGet(`/scripts/stop-script/test`);
      setLoadingScript(false);
      setRunningScript(false);
    } catch (error) {
      console.error(error);
      onError(error.message);
      setLoadingScript(false);
    }
  }

  const openProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await apiGet(`/scripts/open-profile/test`);
      setLoadingProfile(false);
      setOpenningProfile(true);
    } catch (error) {
      console.error(error);
      onError(error.message);
      setLoadingProfile(false);
    }
  }

  const closeProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await apiGet(`/scripts/close-profile/test`);
      setLoadingProfile(false);
      setOpenningProfile(false);
      setRunningScript(false);
    } catch (error) {
      console.error(error);
      onError(error.message);
      setLoadingProfile(false);
    }
  }

  useEffect(() => { // tai sao dung context, ko dung co chay socket duoc ko !!!
    socket.on('profileTestClosed', (data) => {
      const openning = data.closed;
      setOpenningProfile(!openning);
      setRunningScript(false);
    });

    return () => {
      socket.off('profileTestClosed');
    };
  }, [socket]);

  useEffect(() => {
    socket.on('scriptCompleted', (data) => {
      const running = data.completed;
      setRunningScript(!running);
    });

    return () => {
      socket.off('scriptCompleted');
    };
  }, [socket]);

  useEffect(() => {
    socket.on('logs', (data) => {
      const log = data.log;
      setLogs((prev) => [...prev, log])
      console.log(log)
    });

    return () => {
      socket.off('logs');
    };
  }, [socket]);

  const handleChangeScriptName = (name) => {
    setScriptName(name);
  };

  return (
    <Page title={isEdit ? `Script ${data?.name ? ` - ${data?.name}` : ''}` : `Script - Tạo mới`}>
      <Container>
        <HeaderBack
          heading={
            <div className='d-flex gap-10 align-items-center'>
              <span>
                {isEdit ? `Cập nhật script` : `Tạo script`}
              </span>
              {(isEdit && data?.name) ?
                <BadgePrimaryOutline
                >
                  <span className='text-too-long-400'>
                    {data?.name} {data?.project_name && `(${data?.project_name})`}
                  </span>
                </BadgePrimaryOutline>
                :
                scriptName?.trim() !== '' ?
                  <Badge
                    className='badge select-none bdr'
                    style={{
                      backgroundColor: `white`,
                      color: 'black',
                      borderColor: `white`,
                    }}
                  >
                    <span className='text-too-long-400'>
                      {scriptName}
                    </span>
                  </Badge> : null}
            </div>
          }
          url={PATH_DASHBOARD.script.list}
          actions={
            <>
              {(openningProfile) ?
                <ButtonOutlineOrange
                  onClick={closeProfile}
                  style={{
                    opacity: loadingProfile || loadingScript ? '0.5' : '1',
                    pointerEvents: loadingProfile || loadingScript ? 'none' : '',
                  }}
                  icon={loadingProfile ? <Loader className="animate-spin" /> : <Chrome />}
                  title='Close'
                />
                :
                <ButtonOutlineInfo
                  onClick={openProfile}
                  style={{
                    opacity: loadingProfile || loadingScript ? '0.5' : '1',
                    pointerEvents: loadingProfile || loadingScript ? 'none' : '',
                  }}
                  icon={loadingProfile ? <Loader className="animate-spin" /> : <Chrome />}
                  title='Open'
                />
              }
              {runnningScript ?
                <ButtonOrange
                  icon={loadingScript ? <Loader className="animate-spin" /> : <CirclePlay />}
                  title='Stop'
                  onClick={stopScript}
                  style={{
                    opacity: loadingScript ? '0.5' : '1',
                    pointerEvents: loadingScript ? 'none' : '',
                  }}
                />
                :
                <ButtonInfo
                  icon={loadingScript ? <Loader className="animate-spin" /> : <CirclePlay />}
                  title='Run'
                  onClick={runScript}
                  style={{
                    opacity: (loadingScript || loadingProfile || data?.logicItems?.length <= 0) ? '0.5' : '1',
                    pointerEvents: (loadingScript || loadingProfile || data?.logicItems?.length <= 0) ? 'none' : '',
                  }}
                />
              }
              <ButtonOutline
                icon={<Logs />}
                title='Logs'
                onClick={() => setOpenLogs(true)}
              />
              {data?.logicItems?.length > 0 &&
                <ButtonOutline
                  icon={<Code />}
                  title='Code'
                  onClick={() => setOpenPreviewCode(true)}
                />
              }
              <ButtonPrimary
                icon={<Save />}
                onClick={() => setOpenScript(true)}
                title='Lưu'
              />
            </>
          }
        />

        <Drawer
          className='drawer-run-test'
          title={
            <div className='h-5'>
              <span className='fw-500 color-white font-inter'>Logs</span>
              <UnderlineHeader className='mt-10' />
            </div>
          }
          placement="right"
          width={700}
          closable={false}
          onClose={() => setOpenLogs(false)}
          open={openLogs}
          contentWrapperStyle={{ boxShadow: 'none' }}
        // maskClosable={!loadingScript}
        // keyboard={!loadingScript}
        // getContainer={false}
        >
          <div className='mb-10'>
            <ScriptLogs logs={logs || []} />
          </div>
        </Drawer>

        <Modal
          keepMounted
          width={800}
          // height={300}
          size='md'
          title={isEdit ? 'Cập nhật script' : 'Tạo script'}
          onClose={() => setOpenScript(false)}
          isOpen={openScript}
          content={
            <ScriptNewEditForm
              currentScript={data}
              onChangeScriptName={handleChangeScriptName}
              isEdit={isEdit}
            />
          }
        />

        <ScriptNewEditDetailsMemo
          currentLogicItems={data?.logicItems || []}
          onUpdateData={handleUpdateLogicItems}
          actionData={ACTIONS_DATA}
        />

        <Modal
          size='xl'
          isOpen={openPreviewCode}
          onClose={() => setOpenPreviewCode(false)}
          title={"Preview Code"}
          content={
            <div>
              <ScriptPreviewCode currentScript={data} />
            </div>
          }
        />
      </Container>
    </Page>

  )
}

const UnderlineHeader = ({ ...other }) => {
  return (
    <div style={{ borderBottom: `1px solid #404040` }}{...other} />
  )
}
