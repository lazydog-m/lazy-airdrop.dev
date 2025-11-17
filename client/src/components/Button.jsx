import { Button } from "./ui/button";
import { Badge } from '@/components/ui/badge'
import { Separator } from "./ui/separator";
import { lightenColor } from "@/utils/convertUtil";

export const ButtonPrimary = ({ icon, title, ...other }) => {
  return (
    <Button className='button-primary select-none font-inter pointer color-white h-40 fs-13' {...other}>
      {icon}
      {title}
    </Button>
  )
}

export const ButtonOutlineInfo = ({ icon, title, ...other }) => {
  return (
    <Button className='button-outline-info select-none font-inter pointer h-40 fs-13 d-flex' {...other}>
      {icon} {title}
    </Button>
  )
}

export const ButtonInfo = ({ icon, title, ...other }) => {
  return (
    <Button className='button-info px-3 items-center select-none font-inter pointer h-40 fs-13 d-flex' {...other}>
      <span className="mb-1">
        {icon}
      </span>
      {title}
    </Button>
  )
}

// export const ButtonInfo = ({ icon, title, ...other }) => {
//   return (
//     <Button
//       {...other}
//       className="
//         flex items-center justify-center
//         select-none font-inter pointer
//         px-3 fs-13 h-40
//         leading-none align-middle
//         button-info
//       "
//     >
//       <span className="flex items-center justify-center">{icon}</span>
//       <span className="relative top-[0.5px]">{title}</span>
//     </Button>
//   )
// }

export const ButtonOutlinePrimary = ({ icon, title, ...other }) => {
  return (
    <Button className='button-outline-primary select-none font-inter pointer h-40 fs-13 d-flex' {...other}>
      {icon}
      {title}
    </Button>
  )
}

export const ButtonOutlineOrange = ({ icon, title, ...other }) => {
  return (
    <Button
      className='font-inter button-outline-orange select-none bdr pointer color-white h-40 fs-13 d-flex'
      {...other}
    >
      {icon}
      {title}
    </Button>
  )
}

export const ButtonOrange = ({ icon, title, ...other }) => {
  return (
    <Button
      className='font-inter button-orange px-3 select-none bdr pointer color-white h-40 fs-13 d-flex'
      {...other}
    >
      <span className="mb-1">
        {icon}
      </span>
      {title}
    </Button>
  )
}

export const ButtonDanger = ({ icon, title, ...other }) => {
  return (
    <Button variant={'destructive'} className='font-inter select-none bdr pointer color-white h-40 fs-13 d-flex' {...other}>
      {icon}
      {title}
    </Button>
  )
}

export const ButtonSuccess = ({ icon, title, ...other }) => {
  return (
    <Button className='button-success select-none font-inter pointer h-40 fs-13 d-flex' {...other}>
      {icon} {title}
    </Button>
  )
}

export const ButtonOutline = ({ icon, title, isReverse, ...other }) => {

  if (isReverse) {
    return (
      <Button className='button-outlined px-3 font-inter pointer color-white h-40 fs-13 d-flex align-items-center justify-content-center select-none' {...other}>
        {title}
        <span className="mb-1">
          {icon}
        </span>
      </Button>
    )
  }

  return (
    <Button className='button-outlined px-3 font-inter pointer color-white h-40 fs-13 d-flex  align-items-center justify-content-center  select-none' {...other}>
      <span className="mb-1">
        {icon}
      </span>
      {title}
    </Button>
  )
}

export const ButtonIcon = ({ icon, variant = 'outline', ...other }) => {
  return (
    <Button
      className="pointer button-icon select-none bdr"
      variant={variant}
      size='icon'
      {...other}
    >
      {icon}
    </Button>
  )
}

export const ButtonGhost = ({ icon, title, isReverse, ...other }) => {
  if (isReverse) {
    return (
      <Button
        variant='ghost'
        className={`color-white font-inter pointer fs-13 h-40 d-flex align-items-center button-ghost bdr`}
        {...other}
      >
        {icon} {title}
      </Button>
    )
  }

  return (
    <Button
      variant='ghost'
      className={`color-white font-inter pointer fs-13 h-40 d-flex align-items-center bdr button-ghost`}
      {...other}
    >
      {title} {icon}
    </Button>
  )
}

export const ButtonOutlineTags = ({ icon, title, selected = [], tags, showTagOne = false, showTagZero = false, ...other }) => {
  return (
    <Button {...other}>

      <div className={`d-flex fw-500 align-items-center gap-8 ${selected.length > 0 && 'pe-8'}`}>
        {icon} {title}
      </div>

      {selected.length > 0 &&
        <Separator orientation="vertical" className='h-4 sepa' />
      }

      {(selected.length > 0 && selected.length < 3 && !showTagOne) ?
        <div className="d-flex align-items-center gap-1 ps-8">
          {tags}
        </div>
        : selected.length > 2 && !showTagOne ?
          <div className="d-flex align-items-center gap-1 ps-8">
            <Badge className='font-inter bdr fw-400 fs-12 bg-color' style={{ borderColor: lightenColor('#606060', 0.05), color: 'white' }}>{`${selected.length} lựa chọn`}</Badge>
          </div>
          : null
      }

      {selected.length > 0 && showTagOne &&
        <div className="d-flex align-items-center gap-1 ps-8">
          <Badge className='font-inter bdr fw-400 fs-12 bg-color' style={{ borderColor: lightenColor('#606060', 0.05), color: 'white' }}>{`${selected.length} lựa chọn`}</Badge>
        </div>
      }

    </Button>
  )
}

