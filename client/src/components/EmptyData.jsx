import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { Inbox } from "lucide-react";

export default function EmptyData({ message = 'Empty', table = true }) {

  if (table) {
    return (
      <div className='font-inter empty-data color-white text-center' style={{ padding: '70px' }}>
        <Inbox className='mx-auto bg-color-light p-15 rounded-4xl' size={'60px'} strokeWidth={1.8} />
        <span className='mt-10 d-block fw-500 fs-16'>
          {message}
        </span>
      </div>
    )
  }

  return (

    <TableContainer
      component={Paper}
      className='custom-table'
    >
      <Table
        stickyHeader
        className='table-default'
      >
        <TableBody>
          <TableRow>
            <div
              className='font-inter empty-data color-white text-center'
              style={{
                padding: '70px',
              }}
            >
              <Inbox className='mx-auto bg-color-light p-15 rounded-4xl' size={'60px'} strokeWidth={1.8} />
              <span className='mt-10 d-block fw-500 fs-16'>
                {message}
              </span>
            </div>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
