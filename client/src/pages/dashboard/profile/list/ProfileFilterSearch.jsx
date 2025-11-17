import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Chrome, CirclePause, CirclePlay, CirclePlus, Grip, ListFilter, Pause, Play, Vault } from 'lucide-react';
import Popover from "@/components/Popover";
import { ButtonGhost, ButtonInfo, ButtonOrange, ButtonOutline, ButtonOutlineInfo, ButtonOutlinePrimary, ButtonOutlineTags, ButtonPrimary } from '@/components/Button';
import { Color, StatusCommon } from '@/enums/enum';
import { Badge } from '@/components/ui/badge';
import useDebounce from '@/hooks/useDebounce';
import useSpinner from '@/hooks/useSpinner';
import { apiGet } from '@/utils/axios';
import useMessage from '@/hooks/useMessage';
import { convertResource, convertStatusCommonEnumToColorHex, convertStatusCommonEnumToText, darkenColor, lightenColor } from '@/utils/convertUtil';
import { DropdownCheckboxMenu } from '@/components/Checkbox';
import { RESOURCES } from '@/commons/Resources';
import InputUi from '@/components/InputUi';
import useConfirm from '@/hooks/useConfirm';
import Modal from '@/components/Modal';
import Select from '@/components/Select';

export default function ProfileFilterSearch({
  selectedStatusItems,
  onChangeSelectedStatusItems,
  onClearSelectedStatusItems,

  selectedResourceItems,
  onChangeSelectedResourceItems,
  onClearSelectedResourceItems,

  onClearAllSelectedItems,

  search,
  onChangeSearch,

  selected = [],

  onAddOpenningIds,
  onRemoveOpenningIds,

  loadingIds = new Set(),
  openningIds = new Set(),
}) {

  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const { onOpen, onClose } = useSpinner();
  const { onSuccess, onError } = useMessage();
  const { showLoading, swalClose } = useConfirm();
  const [filterSearch, setFilterSearch] = useState('');

  const debounceValue = useDebounce(filterSearch, 500);

  useEffect(() => {
    onChangeSearch(debounceValue);
  }, [debounceValue]);

  const clearAll = () => {
    onClearAllSelectedItems();
    setFilterSearch('');
  }

  const openProfiles = async () => {
    const params = {
      ids: selected,
      scale,
    }

    try {
      showLoading();
      const response = await apiGet("/profiles/open-multiple", params);
      const ids = response.data.data;
      onAddOpenningIds(ids);
      swalClose();
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }

  const closeProfiles = async () => {
    const params = {
      ids: selected,
    }

    try {
      showLoading();
      const response = await apiGet("/profiles/close-multiple", params);
      const ids = response.data.data;
      onRemoveOpenningIds(ids);
      swalClose();
    } catch (error) {
      console.error(error);
      onError(error.message);
      swalClose();
    }
  }

  const sortProfileLayouts = async () => {
    const params = {
      // ids: selected,
    }

    try {
      onOpen();
      const response = await apiGet("/profiles/sort-layout", params);
      // const ids = response.data.data;
      // onRemoveOpenningIds(ids);
      onClose();
    } catch (error) {
      console.error(error);
      onError(error.message);
      onClose();
    }
  }

  const handleOpenProfiles = () => {
    openProfiles();
  }

  const handleCloseProfiles = () => {
    closeProfiles();
  }

  const handleSortProfileLayout = () => {
    sortProfileLayouts();
  }

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };
  //
  // const handleClose = () => {
  //   setOpen(false);
  // };

  return (
    <>
      <div className="mt-20 justify-content-between align-items-center flex">
        <div className="filter-search d-flex gap-10">
          <InputUi
            placeholder='Tìm kiếm profiles ...'
            style={{ width: '250px' }}
            className='custom-input'
            value={filterSearch}
            onChange={(event) => setFilterSearch(event.target.value)}
          />

          <Popover className='button-dropdown-filter-checkbox'
            trigger={
              <ButtonOutlineTags
                showTagOne
                title={resourcesFilters.name}
                icon={<CirclePlus />}
                className='button-outlined font-inter pointer color-white h-40 fs-13 d-flex'
                selected={selectedResourceItems}
                tags={
                  <Tags
                    selectedItems={selectedResourceItems}
                    convert={convertResource}
                  />

                }
              />
            }
            content={
              <DropdownCheckboxMenu
                convert={convertResource}
                items={resourcesFilters.items}
                selectedItems={selectedResourceItems}
                onChangeSelectedItems={onChangeSelectedResourceItems}
                onClearSelectedItems={onClearSelectedResourceItems}
              />
            }
          />

          <Popover className='button-dropdown-filter-checkbox'
            trigger={
              <ButtonOutlineTags
                title={statusFilters.name}
                icon={<CirclePlus />}
                className='button-outlined font-inter pointer color-white h-40 fs-13 d-flex'
                selected={selectedStatusItems}
                tags={
                  <Tags
                    selectedItems={selectedStatusItems}
                    style={convertStatusCommonEnumToColorHex}
                    convert={convertStatusCommonEnumToText}
                  />

                }
              />
            }
            content={
              <DropdownCheckboxMenu
                convert={convertStatusCommonEnumToText}
                items={statusFilters.items}
                selectedItems={selectedStatusItems}
                onChangeSelectedItems={onChangeSelectedStatusItems}
                onClearSelectedItems={onClearSelectedStatusItems}
              />
            }
          />

          {(selectedStatusItems.length > 0 || filterSearch) &&
            <ButtonGhost
              icon={<ListFilter color={Color.ORANGE} />}
              onClick={clearAll}
            />
          }
        </div>
      </div>

      <div className='flex items-center gap-10 mt-10'>
        <Select
          form={false}
          style={{ width: 'auto' }}
          value={scale}
          // prefix='Scale'
          onValueChange={(value) => setScale(value)}
          convertItem={(value) => `${value * 100}%`}
          items={[1, 0.5, 0.4, 0.3]}
        />
        <ButtonInfo
          style={{
            opacity: (selected.length <= 0 || loadingIds.size > 0) ? '0.5' : '1',
            pointerEvents: (selected.length <= 0 || loadingIds.size > 0) ? 'none' : '',
          }}
          onClick={handleOpenProfiles}
          icon={<Chrome />}
          title={`Open`}
        />

        <ButtonOrange
          style={{
            opacity: (selected.length <= 0 || loadingIds.size > 0) ? '0.5' : '1',
            pointerEvents: (selected.length <= 0 || loadingIds.size > 0) ? 'none' : '',
          }}
          onClick={handleCloseProfiles}
          icon={<Chrome />}
          title={'Close'}
        />
        <ButtonOutline
          style={{
            opacity: (openningIds.size <= 0) ? '0.5' : '1',
            pointerEvents: (openningIds.size <= 0) ? 'none' : '',
          }}
          onClick={handleSortProfileLayout}
          icon={<Grip />}
          title={'Sắp xếp'}
        />
        <ButtonInfo
          style={{
            opacity: (openningIds.size <= 0) ? '0.5' : '1',
            pointerEvents: (openningIds.size <= 0) ? 'none' : '',
          }}
          // onClick={handleSortProfileLayout}
          icon={<CirclePlay />}
          title={'Run with script'}
        />
      </div>
    </>
  )
}

const resourcesFilters = {
  name: 'Tài nguyên',
  items: RESOURCES.map(res => res.id),
};

const statusFilters = {
  name: 'Trạng thái',
  items: [
    StatusCommon.IN_ACTIVE, StatusCommon.UN_ACTIVE
  ],
};

const Tags = ({ selectedItems, style = () => { }, convert }) => {
  return (
    selectedItems.map((item) => {
      return (
        <Badge
          style={{
            backgroundColor: darkenColor(style(item)),
            borderColor: lightenColor(style(item)),
            color: 'white'
          }}
          className='text-capitalize fw-400 fs-12 bdr'
        >
          {convert ? convert(item) : item}
        </Badge>
      )
    })
  )
}
