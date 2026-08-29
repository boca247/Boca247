import os
import json
import requests
from datetime import datetime, timezone, timedelta

API_KEY = os.environ.get("API_FOOTBALL_KEY")

BASE_URL = "https://v3.football.api-sports.io"

HEADERS = {
    "x-apisports-key": API_KEY
}

# Boca Juniors - ID de API-Football
BOCA_ID = 1941


def api_get(endpoint, params=None):
    response = requests.get(
        BASE_URL + endpoint,
        headers=HEADERS,
        params=params,
        timeout=30
    )

    response.raise_for_status()

    data = response.json()

    if data.get("errors"):
        raise Exception(str(data["errors"]))

    return data.get("response", [])


def guardar(datos):

    with open(
        "partido.json",
        "w",
        encoding="utf-8"
    ) as archivo:

        json.dump(
            datos,
            archivo,
            ensure_ascii=False,
            indent=2
        )


def obtener_partido():

    ahora = datetime.now(
        timezone.utc
    )

    fecha_desde = (
        ahora - timedelta(days=2)
    ).strftime("%Y-%m-%d")

    fecha_hasta = (
        ahora + timedelta(days=7)
    ).strftime("%Y-%m-%d")


    partidos = api_get(
        "/fixtures",
        {
            "team": BOCA_ID,
            "from": fecha_desde,
            "to": fecha_hasta,
            "season": 2026
        }
    )


    if not partidos:

        guardar({
            "estado": "SIN PARTIDO",
            "local": "Boca Juniors",
            "visitante": "",
            "resultado": "-",
            "competencia": "",
            "minuto": "",
            "incidencias": []
        })

        print("No se encontró partido.")
        return


    # Buscar primero un partido en vivo
    partido = None

    estados_vivo = [
        "1H",
        "HT",
        "2H",
        "ET",
        "BT",
        "P"
    ]

    for p in partidos:

        estado = p["fixture"]["status"]["short"]

        if estado in estados_vivo:
            partido = p
            break


    # Si no hay partido en vivo,
    # buscar el más reciente o próximo
    if partido is None:

        partidos_ordenados = sorted(
            partidos,
            key=lambda x: x["fixture"]["date"]
        )

        finalizados = [
            p for p in partidos_ordenados
            if p["fixture"]["status"]["short"]
            in ["FT", "AET", "PEN"]
        ]

        if finalizados:

            partido = finalizados[-1]

        else:

            partido = partidos_ordenados[0]


    fixture_id = partido["fixture"]["id"]

    fixture = partido["fixture"]

    teams = partido["teams"]

    goals = partido["goals"]

    status = fixture["status"]


    local = teams["home"]["name"]

    visitante = teams["away"]["name"]


    resultado_local = goals["home"]

    resultado_visitante = goals["away"]


    if resultado_local is None:
        resultado_local = 0

    if resultado_visitante is None:
        resultado_visitante = 0


    estado_api = status["short"]

    estados_finales = [
        "FT",
        "AET",
        "PEN"
    ]


    if estado_api in estados_finales:

        estado = "FINAL"

    elif estado_api in estados_vivo:

        estado = "EN VIVO"

    else:

        estado = "PRÓXIMO"


    minuto = status.get(
        "elapsed"
    )

    if estado == "EN VIVO" and minuto:

        minuto_texto = (
            str(minuto) + "'"
        )

    else:

        minuto_texto = ""


    competencia = (
        partido["league"]["name"]
    )


    incidencias = []


    # Obtener eventos del partido
    eventos = api_get(
        "/fixtures/events",
        {
            "fixture": fixture_id
        }
    )


    for evento in eventos:

        tipo = evento.get(
            "type",
            ""
        )

        detalle = evento.get(
            "detail",
            ""
        )

        minuto_evento = evento.get(
            "time",
            {}
        ).get(
            "elapsed"
        )

        extra = evento.get(
            "time",
            {}
        ).get(
            "extra"
        )

        jugador = evento.get(
            "player",
            {}
        ).get(
            "name"
        )


        if minuto_evento is None:

            minuto_evento = ""


        if extra:

            minuto_evento = (
                f"{minuto_evento}+{extra}'"
            )

        elif minuto_evento:

            minuto_evento = (
                f"{minuto_evento}'"
            )


        # GOLES
        if tipo == "Goal":

            incidencias.append({
                "minuto": minuto_evento,
                "tipo": "gol",
                "jugador": jugador or "",
                "detalle": detalle or ""
            })


        # TARJETA AMARILLA
        elif tipo == "Card" and (
            "Yellow" in detalle
            or "yellow" in detalle
        ):

            incidencias.append({
                "minuto": minuto_evento,
                "tipo": "amarilla",
                "jugador": jugador or "",
                "detalle": detalle
            })


        # TARJETA ROJA
        elif tipo == "Card" and (
            "Red" in detalle
            or "red" in detalle
        ):

            incidencias.append({
                "minuto": minuto_evento,
                "tipo": "roja",
                "jugador": jugador or "",
                "detalle": detalle
            })


        # CAMBIOS
        elif tipo == "subst":

            jugador_sale = (
                evento.get(
                    "player",
                    {}
                ).get(
                    "name"
                )
            )

            jugador_entra = (
                evento.get(
                    "assist",
                    {}
                ).get(
                    "name"
                )
            )

            incidencias.append({
                "minuto": minuto_evento,
                "tipo": "cambio",
                "jugador": jugador_entra or "",
                "detalle":
                    "Entra: " +
                    str(jugador_entra or "") +
                    " | Sale: " +
                    str(jugador_sale or "")
            })


    # Orden cronológico
    incidencias.sort(
        key=lambda x: str(
            x.get("minuto", "")
        )
    )


    datos = {

        "estado": estado,

        "fixture_id": fixture_id,

        "local": local,

        "visitante": visitante,

        "resultado":
            f"{resultado_local}-{resultado_visitante}",

        "competencia": competencia,

        "minuto": minuto_texto,

        "incidencias": incidencias

    }


    guardar(datos)


    print(
        "Partido actualizado:",
        local,
        resultado_local,
        "-",
        resultado_visitante,
        visitante
    )

    print(
        "Estado:",
        estado
    )

    print(
        "Incidencias:",
        len(incidencias)
    )


if __name__ == "__main__":

    if not API_KEY:

        raise Exception(
            "No existe el secreto API_FOOTBALL_KEY"
        )

    obtener_partido()
