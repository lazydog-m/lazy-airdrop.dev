import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { ListFilter, UserLock, UserRoundCheck, UserRoundMinus, UserRoundSearch, UserRoundX, Users } from 'lucide-react';
import { ButtonGhost } from '@/components/Button';
import { Color, StatusCommon } from '@/enums/enum';
import useDebounce from '@/hooks/useDebounce';
import { TabsUi } from '@/components/TabsUi';
import TooltipUi from '@/components/TooltipUi';
import InputUi from '@/components/InputUi';
import { LiaUserLockSolid } from "react-icons/lia";
import { convertStatusCommonEnumToText } from '@/utils/convertUtil';

export default function ProjectProfileFilterSearch({
  selectedTab,
  onChangeSelectedTab = () => { },

  onClearAllSelectedItems = () => { },

  onChangeSearch = () => { },
  search = '',

  action = {},
  pagination = {},
  projectName = '',
}) {

  const [filterSearch, setFilterSearch] = useState('');

  const debounceValue = useDebounce(filterSearch, 500);

  useEffect(() => {
    onChangeSearch(debounceValue);
  }, [debounceValue]);

  const [filterTab, setFilterTab] = useState(selectedTab);

  const debounce = useDebounce(filterTab, 50);

  useEffect(() => {
    onChangeSelectedTab(debounce);
  }, [debounce]);

  const clearAll = () => {
    onClearAllSelectedItems();
    setFilterSearch('');
  }

  const tabs = [
    {
      name: convertStatusCommonEnumToText(StatusCommon.IN_ACTIVE),
      value: StatusCommon.IN_ACTIVE,
      total: pagination?.totalItemsActive || 0,
      icon: <UserRoundCheck size={17} />
    },
    {
      name: convertStatusCommonEnumToText(StatusCommon.UN_ACTIVE),
      value: StatusCommon.UN_ACTIVE,
      total: pagination?.totalItemsUnActive || 0,
      icon: <UserRoundX size={17} />
    },
    {
      name: `Chưa tham gia`,
      value: "free",
      total: pagination?.totalItemsFree || 0,
      icon: <UserRoundMinus size={17} />
    },
  ];

  return (
    <>
      <div className="d-flex justify-content-between items-center mt-2">
        <div className="d-flex gap-10 items-center">
          <TabsUi
            tabs={tabs}
            selectedTab={filterTab}
            onChangeTab={(value) => setFilterTab(value)}
          />
          <InputUi
            placeholder='Tìm kiếm profiles ...'
            style={{ width: '250px' }}
            className='custom-input'
            value={filterSearch}
            onChange={(event) => setFilterSearch(event.target.value)}
          />
          {filterSearch &&
            <ButtonGhost
              icon={<ListFilter color={Color.ORANGE} />}
              onClick={clearAll}
            />
          }
        </div>
        <div className='d-flex items-center gap-10'>
          <div
            className='me-2
                items-center border-none inline-flex select-none gap-0 h-40 bg-color-light pdi-15 border-primary-2
                '
          >
            <div className='fs-13 fw-500 flex gap-1'>
              <Users size={18} />
              {`100 - 100,000 Points`}
            </div>
          </div>
          {action}
        </div>
      </div>

    </>
  )
}
