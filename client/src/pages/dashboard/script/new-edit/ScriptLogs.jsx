import { Color } from "@/enums/enum";

export default function ScriptLogs({
  logs = []
}) {

  // lam sao de biet log dag action gi ?? chi tiet hon, button view wmore log ? bam vao log nao thif biey doc log do dag o dau trong list, mof form
  return (
    <div className="logs-container font-inter fs-14">
      {logs.map((log, index) => {
        const isFinished = log?.action === 'finished';
        const totalDuration = isFinished
          ? logs
            .reduce((acc, log) => acc + (log?.duration || 0), 0)
          : null;

        return (
          <>
            <div className="logs d-flex align-items-center" key={index}>
              <span className="log-item log-time fw-400">{log?.time}</span>

              <span
                className="log-item log-action"
                style={{
                  color: isFinished ? 'white' : Color.PRIMARY,
                }}
              >
                <span className={isFinished ? '' : 'pointer'}
                  style={{
                    fontWeight: isFinished ? '400' : '500',
                  }}
                >
                  {isFinished ? `Script completed in ${`${totalDuration} ms`}` : log?.action}
                </span>
                {log?.target &&
                  <span
                    className="fw-500"
                    style={{ color: Color.BROWN }}
                  >
                    {' 🡆 '}
                    {` '${log?.target || '?'}'`}
                  </span>
                }
              </span>

              {!isFinished ?
                <>
                  <span className="log-item">|</span>

                  <span className="log-item log-duration">{`${log?.duration} ms`}</span>
                </>
                : null
              }
              <span
                className="log-item log-status fw-500"
                style={{ color: log?.status === 'Failed' ? Color.ORANGE : Color.SUCCESS }}
              >
                {`[${log?.status}]`}
              </span>
            </div>

            {log?.errorMsg &&
              <>
                <span className="log-item log-message" style={{ color: Color.ORANGE }}>{log?.errorMsg}</span>
              </>
            }
          </>
        )
      })}
    </div>

  )
}


