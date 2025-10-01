import moment from 'moment'
import 'moment/locale/es'
moment.locale('es')

export const timeAgo = (date: Date) => {
  return moment(date).fromNow()
}

export const formatLongDate = (date: Date) => {
  return moment(date).format('D [de] MMMM [de] YYYY [a las] HH:mm')
}
