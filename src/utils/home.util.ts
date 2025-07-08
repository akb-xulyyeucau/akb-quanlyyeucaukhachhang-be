interface DateRange {
    startDate: Date;
    endDate: Date;
  }
  
export const formatPeriodLabel = (
    mode: 'month' | 'quarter' | 'year',
    startDate: Date,
    endDate?: Date
  ): string => {
    switch (mode) {
      case 'month':
        // Định dạng MM/YYYY
        if (endDate) {
          return `${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()} - ${String(endDate.getMonth() + 1).padStart(2, '0')}/${endDate.getFullYear()}`;
        }
        return `${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()}`;
  
      case 'quarter':
        // Định dạng QQ/YYYY (Q = 01-04)
        const startQuarter = Math.floor(startDate.getMonth() / 3) + 1;
        if (endDate) {
          const endQuarter = Math.floor(endDate.getMonth() / 3) + 1;
          return `${String(startQuarter).padStart(2, '0')}/${startDate.getFullYear()} - ${String(endQuarter).padStart(2, '0')}/${endDate.getFullYear()}`;
        }
        return `${String(startQuarter).padStart(2, '0')}/${startDate.getFullYear()}`;
  
      case 'year':
        // Định dạng YYYY
        if (endDate) {
          return `${startDate.getFullYear()} - ${endDate.getFullYear()}`;
        }
        return `${startDate.getFullYear()}`;
    }
  };
  
  export const calculateDateRange = (
    mode: 'month' | 'quarter' | 'year',
    startDate: Date,
    endDate?: Date
  ): DateRange => {
    let start: Date;
    let end: Date;
  
    switch (mode) {
      case 'month':
        // Tháng/năm được chọn đến tháng/năm kết thúc
        start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        if (endDate) {
          end = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
        } else {
          end = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        }
        break;
  
      case 'quarter':
        // Quý/năm được chọn đến quý/năm kết thúc
        const startQuarter = Math.floor(startDate.getMonth() / 3);
        start = new Date(startDate.getFullYear(), startQuarter * 3, 1);
        
        if (endDate) {
          const endQuarter = Math.floor(endDate.getMonth() / 3);
          end = new Date(endDate.getFullYear(), (endQuarter + 1) * 3, 0);
        } else {
          end = new Date(startDate.getFullYear(), (startQuarter + 1) * 3, 0);
        }
        break;
  
      case 'year':
        // Năm bắt đầu đến năm kết thúc
        start = new Date(startDate.getFullYear(), 0, 1);
        if (endDate) {
          end = new Date(endDate.getFullYear(), 11, 31);
        } else {
          end = new Date(startDate.getFullYear(), 11, 31);
        }
        break;
    }
  
    return { startDate: start, endDate: end };
  };