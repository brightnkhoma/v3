export function firestoreTimestampToDate(timestamp: { seconds: number; nanoseconds: number }): Date {
  try {
    
    return new Date(timestamp.seconds * 1000);
  } catch (error) {
    console.log(error);
    return new Date()
    
    
  }
}
