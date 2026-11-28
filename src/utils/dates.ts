const indexDate = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: 'UTC',
});

export const formatIndexDate = (date: Date): string => indexDate.format(date);
