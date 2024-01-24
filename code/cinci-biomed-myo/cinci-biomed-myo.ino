#include "signal_proc.h"

#define SIGNAL_PIN A0


RollingMin<10> minimum;
RollingMax<10> maximum;
RollingAvg<5> avg;
RollingAvg<50> smoothMax;
RollingAvg<50> smoothMin;
RollingAvg<50> smoothDiff;
RollingAvg<80> music;


struct seg_t {
	double lo, hi;
	int levels;
};
struct seg_t s = { 0, 0.8, 5 };


double clamp(double x, double min, double max) {
  if (x < min) { return min; }
  else if (x > max) { return max; }
  else { return x; }
}

double segment(double value, struct seg_t s) {
	double delta = s.hi - s.lo;
	double a = (value - s.lo) / delta;
	int level = floor(a * s.levels);
	if (level > s.levels) { level = s.levels; }
  else if (level < 0) { level = 0; }
	return ((double)level)/s.levels;
}


void setup() {
	Serial.begin(115200);
}

void loop() {
	double sig = analogRead(SIGNAL_PIN);
	avg.push(sig);
	double centered = sig - avg.value();
  centered = clamp(centered, -20, 20);
	minimum.push(centered);
	maximum.push(centered);
	smoothMin.push(minimum.value());
	smoothMax.push(maximum.value());
	// Serial.print(centered); Serial.print(" ");
	// Serial.print((smoothMin.value())); Serial.print(" ");
	// Serial.print((smoothMax.value())); Serial.print(" ");
	Serial.print(s.levels); Serial.print(" 0 ");
  // Serial.print("2 0 ");
	double diff = smoothMax.value() - smoothMin.value();
  // clamp diff to range [0, 50]
  if (diff < 0) { diff = 0; }
  else if (diff > 50) { diff = 50; }
	// double ldiff = diff < 2.718 ? 0 : log(log(diff));
  double ldiff = clamp(log(diff), 0, 2)/2;
	smoothDiff.push(ldiff);
	music.push(segment(smoothDiff.value(), s));
	Serial.print(5*smoothDiff.value()); Serial.print(" ");
  // music.push( segment(log(sqrt(smoothDiff.value()/2)), s) );
	Serial.print((int) (s.levels * music.value())); Serial.print(" ");
	// Serial.println(ldiff);
  Serial.println();
}
