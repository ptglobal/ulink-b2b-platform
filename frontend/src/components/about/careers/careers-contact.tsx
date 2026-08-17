import { MapPin, Phone, Mail } from '@/components/icons';

export function CareersContact() {
  return (
    <section className="py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          LIÊN HỆ & ĐỊA CHỈ
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Phòng Nhân Sự ULink Industries
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: HR Contacts */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500">Trụ sở Hà Nội</span>
                <span className="text-xs font-bold text-slate-800">
                  Tầng 8, Tòa nhà HL Building, Cầu Giấy, Hà Nội
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500">
                  Hotline tuyển dụng
                </span>
                <span className="text-xs font-bold text-slate-800">024 7300 9899</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500">Email nhận CV</span>
                <span className="text-xs font-bold text-slate-800">hr@ulink.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Google Map */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <iframe
              title="ULink Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814184964!2d105.78189631502444!3d21.02881188599839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab868b5001e5%3A0x82f49d32d0f507b9!2zQ8CauIEdp4bqteSwgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
