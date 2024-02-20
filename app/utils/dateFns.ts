
export const dateFns = {
  format: (date: Date, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en', options).format(date),
  toHumanReadleDate: (date: Date) => {
    return dateFns.format(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },
  toReadable: (date: Date, type: 'date' | 'time' | 'datetime' = 'datetime') => {
    let options = {} as Intl.DateTimeFormatOptions
    switch (type) {
      case 'time': {
        options = { hour: '2-digit', minute: '2-digit', hour12: true }
        break;
      }
      case 'date': {
        options = { year: 'numeric', month: 'short', day: '2-digit' }
        break;
      }
      case 'datetime': {
        options = {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }
      }
    }
    return dateFns.format(date, options);
  },
  //
  parseDate: (serverDate: string, type: 'date' | 'time' | 'datetime' = 'datetime') => {
    let result = undefined;
    if (serverDate && serverDate.length > 1) {
      if (type === 'datetime') {
        let [date, time] = serverDate.split(" ")
        let [year, month, day] = date.split("-") as unknown as number[]
        let [hour, minute, second] = time.split(":") as unknown as number[]
        result = new Date(year, month - 1, day, hour, minute, second);
      } else if (type === 'date') {
        let [year, month, day] = serverDate.split("-") as unknown as number[]
        result = new Date(year, month - 1, day, 0, 0, 0);
      } else if (type === 'time') {
        let [hour, minute, second] = serverDate.split(":") as unknown as number[]
        let now = new Date();
        result = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);
      }
    }
    return result;
  },
  stringifyDate: (date: Date, type: 'date' | 'time' | 'datetime' = 'datetime') => {
    let result = ''
    if (type === 'date' || type === 'datetime') {
      result += `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }
    if (type === 'datetime') {
      result += ' '
    }
    if (type === 'time' || type === 'datetime') {
      // result += `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
      result += `${date.getHours()}:${date.getMinutes()}:00}`
    }
    return result;
  },
  //
  addMonth: (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount),
  getMonthInfo: (date: Date) => ({
    index: date.getMonth(),
    daysArray: (() => {
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1),
        lastDayOfMonth = new Date(nextMonth.getTime() - 1),
        daysInMonth = lastDayOfMonth.getDate();
      let arrayOfDays = [...new Array(daysInMonth + 1).keys()]
      arrayOfDays.shift();
      return arrayOfDays
    })(),
    shortName: dateFns.format(date, { month: 'short' }),
    longName: dateFns.format(date, { month: 'long' })
  }),
  /**
   * Compares 2 dates (i.e. date1 from date2) based on month & year.
   * 
   * date1 >= date2
   * @param date1 `Date`
   * @param date2 `Date`
   * @returns `boolean`
   */
  compareMonth: (date1: Date, date2: Date) => {
    const y1 = date1.getFullYear()
    const y2 = date2.getFullYear()
    if (y1 > y2) {
      return true;
    } else if (y1 === y2) {
      const m1 = date1.getMonth()
      const m2 = date2.getMonth()
      if (m1 >= m2) {
        return true
      }
    }
    return false
  },
  //
  getDayInfo: (date: Date) => ({
    index: date.getMonth(),
    shortName: dateFns.format(date, { weekday: 'short' }),
    longName: dateFns.format(date, { weekday: 'long' })
  }),
  //

}