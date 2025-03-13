export default function dateFormatter (dateString) {

   const date = new Date(dateString)

   const formattedDate = date.toLocaleDateString("en-US",{
      year:"numeric",
      month:"long",
      day:"numeric"
   })

   return formattedDate
}