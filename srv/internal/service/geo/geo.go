package geo

import (
	"strings"
	"sync"
	"unicode"

	"github.com/sams96/rgeo"
)

// cityFixes repairs the Cities10 names whose accented characters were garbled
// in the source data (bad text encoding).
var cityFixes = map[string]string{
	"Ciudad JuÌÁrez":   "Ciudad Juárez",
	"DamanhÌÈr":        "Damanhūr",
	"DÌùsseldorf":      "Düsseldorf",
	"JaÌ©n":            "Jaén",
	"LÌùderitz":        "Lüderitz",
	"MÌùnster":         "Münster",
	"OsnabrÌùck":       "Osnabrück",
	"PiraiÌ©vs":        "Piraiévs",
	"Saint George‰Ûªs": "Saint George's",
	"San SebastiÌÁn":   "San Sebastián",
	"St. John‰Ûªs":     "St. John's",
	"ZÌùrich":          "Zürich",
}

// cleanCity tidies a Cities10 name. Cities that share a name are numbered in
// the data ("Springfield1", "Springfield3"); rgeo only strips a trailing "2",
// so the rest of the number is removed here.
func cleanCity(name string) string {
	if fixed, ok := cityFixes[name]; ok {
		return fixed
	}
	return strings.TrimRightFunc(name, unicode.IsDigit)
}

// The reverse geocoder takes several seconds and ~500 MB to build, so it is
// built once per process. Call Load in the background at startup; a lookup
// that arrives before it finishes waits for the same build instead of
// starting another.
var (
	loadOnce sync.Once
	geocoder *rgeo.Rgeo
	loadErr  error
)

func Load() error {
	loadOnce.Do(func() {
		geocoder, loadErr = rgeo.New(rgeo.Provinces10, rgeo.Cities10)
		if loadErr == nil {
			geocoder.Build()
		}
	})
	return loadErr
}

// Describe returns "City, Province" for a point, or just "Province" outside
// the urban areas Cities10 covers. The country is left out: finders are in the
// +1 region, so it adds length without helping the owner.
// Returns "" with no error when the point is valid but has no name.
func Describe(lat, lng float64) (string, error) {
	if err := Load(); err != nil {
		return "", err
	}

	location, err := geocoder.ReverseGeocode([]float64{lng, lat})
	if err != nil {
		return "", err
	}

	parts := make([]string, 0, 2)
	for _, part := range []string{cleanCity(location.City), location.Province} {
		if part != "" {
			parts = append(parts, part)
		}
	}
	return strings.Join(parts, ", "), nil
}
