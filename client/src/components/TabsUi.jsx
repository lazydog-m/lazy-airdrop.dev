import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Color } from "@/enums/enum"
import { Badge } from "./ui/badge"

export const TabsUi = ({
  tabs = [],
  selectedTab = '',
  onChangeTab = () => { },
}) => {

  return (
    <>
      <Tabs
        className='gap-4'
        defaultValue={selectedTab}
        value={selectedTab}
        onValueChange={onChangeTab}
      >
        <TabsList className='p-0 bdr h-40'>
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className='pointer font-inter fw-500 select-none
              h-full bdr border-b-3
              transition-all duration-200 ease-in-out
              gap-1
              '
              style={{
                borderColor: selectedTab === tab?.value ? '#ffffff' : '#323230',
                backgroundColor: selectedTab === tab?.value ? '#404040' : '#202020'
              }}
            >
              <span className='gap-7 d-flex text-capitalize items-center'>
                {tab?.icon}
                {tab?.name}
              </span>
              <svg width="24.5" height="24">
                <circle cx="12" cy="12" r="10" fill="white" />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                  fontSize="13"
                  fontWeight='700'
                >
                  {tab?.total || 0}
                </text>
              </svg>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  )
}

export const TabsUi1 = ({
  tabs = [],
  selectedTab = '',
  onChangeTab = () => { },
}) => {

  return (
    <>
      <Tabs
        defaultValue={selectedTab}
        value={selectedTab}
        onValueChange={onChangeTab}
      >
        <TabsList className='h-40 bdr border-none bg-color-light p-0'>
          {tabs?.map((tab) => {
            return (
              <TabsTrigger
                key={tab?.value}
                className={`
                  font-inter fw-500 pointer select-none bdr h-full border-none color-white
                  transition-all duration-200 ease-in-out
                  `}
                value={tab?.value}
                style={{
                  backgroundColor: selectedTab === tab?.value ? '#505050' : '#323230',
                }}
              >
                <span className="flex gap-6 items-center">
                  <span className='gap-6 d-flex text-capitalize'>
                    <span className="mt-1">
                      {tab?.icon}
                    </span>
                    {tab?.name}
                  </span>
                  (10)
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </>
  )
}
