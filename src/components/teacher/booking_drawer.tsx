//import {
//  Drawer,
//  DrawerContent,
//  DrawerHeader,
//  DrawerTitle,
//  DrawerDescription,
//  DrawerFooter,
//  DrawerClose,
//  DrawerTrigger,
//} from "@/components/ui/drawer";
//import { Button } from "@/components/ui/button";
//import { DatePickerDemo } from "../datepicker";
//import {
//  Select,
//  SelectTrigger,
//  SelectItem,
//  SelectValue,
//  SelectContent,
//} from "@/components/ui/select";
//import { Label } from "@/components/ui/label";
//import { ComboboxDemo } from "../combobox";
//
//export function BookingDrawer() {
//  return (
//    <Drawer>
//      <DrawerTrigger asChild>
//        <Button size="sm">Book Session</Button>
//      </DrawerTrigger>
//      <DrawerContent>
//        <div className="mx-auto w-full max-w-sm">
//          <DrawerHeader>
//            <DrawerTitle>Book a Session with {teacher.name}</DrawerTitle>
//            <DrawerDescription>Choose your options</DrawerDescription>
//          </DrawerHeader>
//        </div>
//        <div className="mx-auto max-w-sm">
//          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
//            <div className="space-y-4">
//              {/* Date select  */}
//              {/* Time select  */}
//              <div className="flex flex-col sm:flex-row space-y-4">
//                <div className="space-y-2">
//                  <Label> Date</Label>
//                  <DatePickerDemo
//                    date={date}
//                    setDateAction={(value) => {
//                      if (value instanceof Date) {
//                        handleSetDate(value);
//                      }
//                    }}
//                  />
//                </div>
//                <div className="space-y-2">
//                  <Label> Time</Label>
//                  <Select onValueChange={setTime}>
//                    <SelectTrigger className="w-[180px]">
//                      <SelectValue placeholder="Time" />
//                    </SelectTrigger>
//                    <SelectContent>
//                      {availTimes.map((time) => (
//                        <SelectItem key={time.value} value={time.value}>
//                          {time.label}
//                        </SelectItem>
//                      ))}
//                    </SelectContent>
//                  </Select>
//                </div>
//              </div>
//
//              {/* Subject select  */}
//              <div className="space-y-2">
//                <Label> Subject</Label>
//                <div className="flex justify-center">
//                  <ComboboxDemo
//                    frameworks={subjects}
//                    value={subject}
//                    setValueAction={setSubject}
//                  />
//                </div>
//              </div>
//            </div>
//            <DrawerFooter>
//              <DrawerClose asChild>
//                <button ref={closeRef} className="hidden" />
//              </DrawerClose>
//              <Button size="sm" onClick={handleSubmit}>
//                Submit
//              </Button>
//              <DrawerClose>Cancel</DrawerClose>
//            </DrawerFooter>
//          </form>
//        </div>
//      </DrawerContent>
//    </Drawer>
//  );
//}
