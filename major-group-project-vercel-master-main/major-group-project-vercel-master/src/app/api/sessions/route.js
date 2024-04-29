 import { cookies } from 'next/headers'
 
export async function GET(req,res) {
  const { searchParams } = new URL(req.url)

  const sentUsername = searchParams.get('username')

  // we are grabbing the username
  let record = cookies().get('username');
  console.log(record)
// we are grabbing the auth
  let record2 = cookies().get('auth');
  console.log(record2)


 // when we want to send something back, we need to select the value attribute
  return Response.json({ "data":""+record.value+""})
}
