import moment from "moment"
import "moment/locale/es";
moment.locale("es")

export const timeAgo = (date: Date) => {
    return moment(date).fromNow()
  }