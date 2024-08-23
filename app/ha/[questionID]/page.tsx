import Question from "@/components/Question-Details"

export default function Page({ params }: { params: { questionID: number } }) {
  const id = params.questionID;
  return <div><Question id={id} /></div>
}