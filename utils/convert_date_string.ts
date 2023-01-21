import moment from 'moment';

const convertDateString = (dateString: string): string => {
  const dateTime = moment(dateString, moment.ISO_8601);
  return dateTime.fromNow();
};

export default convertDateString;
